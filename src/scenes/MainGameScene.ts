import { GameObjects, Scene } from 'phaser';
import { Bullet } from '../entities/Bullet';
import { GroupUtils } from '../utils/GroupUtils';
import { Enemy } from '../entities/Enemy';
import { Player } from '../entities/Player';
import { GameDataKeys } from '../GameDataKeys';
import { HealthComponent } from '../components/HealthComponent';

export class MainGameScene extends Scene {
    private player: Player;
    private bullets: Phaser.Physics.Arcade.Group;
    private enemies: Phaser.Physics.Arcade.Group;
    private enemyBullets: Phaser.Physics.Arcade.Group;
    private bg: Phaser.GameObjects.TileSprite;
    private planet: Phaser.GameObjects.Image;
    private planet2: Phaser.GameObjects.Image;
    private scoreText: Phaser.GameObjects.Text;

    constructor() {
        super('MainGameScene');
    }


    preload() {

        const width: number = this.cameras.main.width;
        // const height: number = this.cameras.main.height;
        // const x: number = this.cameras.main.centerX;
        const y: number = this.cameras.main.centerY;

        const progressBar = this.add.graphics();
        const progressBox = this.add.graphics();

        progressBox.fillStyle(0x222222, 0.8);
        progressBox.fillRect(0, y, width, 64);

        this.load.on('progress', (value: number) => {
            console.log(value)
            progressBar.clear();
            progressBar.fillStyle(0xffffff, 1);
            progressBar.fillRect(0, y, width * value, 64);
        });

        this.load.on('complete', () => {
            console.log('complete');
            progressBox.destroy();
            progressBar.destroy();
        });

        this.load.setPath('assets');

        this.load.image('bg', 'Background/bg.png');

        this.load.image('planet', 'Planets/planet01.png');
        this.load.image('planet2', 'Planets/planet09.png');

        this.load.atlas('sprites', 'Spritesheet/gameSprites.png', 'Spritesheet/gameSprites.json');

        this.load.audio('sfx_laser1', 'Sounds/sfx_laser1.ogg');
        this.load.audio('sfx_laser2', 'Sounds/sfx_laser2.ogg');

        this.load.json('playerShips', 'Data/playerShips.json');
    }

    create() {

        this.bg = this.add.tileSprite(0, 0, this.cameras.main.width, this.cameras.main.height, 'bg').setOrigin(0).setTileScale(2);

        this.planet2 = this.add.image(100, -212, 'planet2').setOrigin(0).setScale(0.1);
        this.planet = this.add.image(0, -512, 'planet').setOrigin(0);

        this.bullets = this.physics.add.group({
            classType: Bullet,
            runChildUpdate: true,
            createCallback: (bullet) => {
                (bullet as Bullet).init();
            }
        });

        const bulletUtils = new GroupUtils();
        bulletUtils.preallocateGroup(this.bullets, 5);

        this.player = new Player(this, this.cameras.main.centerX, this.cameras.main.height - 128, 'sprites', this.bullets).setOrigin(0.5);
        this.physics.add.existing(this.player);

        // Sélectionner le bon vaisseau au démarrage
        const selectedShip = this.registry.get(GameDataKeys.SelectedShip) || 1;
        this.player.selectPlayerShip(selectedShip);

        this.player.getComponent(HealthComponent)?.once("death", this.restartGame, this);

        if (this.input.keyboard) {

            this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R).on('down', () => {
                this.restartGame();
            });
        }
        else {
            console.log('no keyboard input');
        }

        this.enemyBullets = this.physics.add.group({
            classType: Bullet,
            runChildUpdate: true,
            createCallback: (bullet) => {
                (bullet as Bullet).init();
            },
            quantity: 5,
            maxSize: 5,
        });

        this.enemies = this.physics.add.group({
            classType: Enemy,
            defaultKey: 'sprites',
            defaultFrame: 'ufoRed.png',
            runChildUpdate: true,
            createCallback: (enemy) => {
                (enemy as Enemy).init(this.enemyBullets);
            }
        });

        const groupUtils = new GroupUtils();
        groupUtils.preallocateGroup(this.enemyBullets, 5);

        this.physics.add.collider(this.bullets, this.enemies,
            (bullet, enemy) => {
                (bullet as Bullet).disable();
                (enemy as Enemy).getComponent(HealthComponent)?.inc(-1);
                this.registry.inc(GameDataKeys.PlayerScore, 1);
            }, (bullet, enemy) => {
                (enemy as Enemy).getComponent(HealthComponent)?.inc(-1);
                (bullet as Bullet).disable();
            });

        this.physics.add.collider(this.player, this.enemyBullets, (player, enemyBullet) => {
            (enemyBullet as Bullet).disable();
            (player as Player).getComponent(HealthComponent)?.inc(-1);
        });

        this.physics.add.collider(this.player, this.enemies, (player, enemy) => {

            const enemyHealth = (enemy as Enemy).getComponent(HealthComponent);
            const playerHealth = (player as Player).getComponent(HealthComponent);

            enemyHealth?.inc(-enemyHealth?.getMax());
            playerHealth?.inc(-1);
        });

        if (!this.anims.exists('ufoShoot')) {
            this.anims.create({
                key: 'ufoShoot',
                frames: [
                    { key: 'sprites', frame: 'ufoRed.png' },
                    { key: 'sprites', frame: 'ufoRed-shoot2.png' },
                    { key: 'sprites', frame: 'ufoRed-shoot3.png' },
                ],
                frameRate: 4,
            })
        }

        this.time.addEvent({
            delay: 1500,
            callback: this.spawnEnemy,
            callbackScope: this,
            loop: true,
        });


        this.add.rectangle(this.cameras.main.centerX, 32, this.cameras.main.width / 5, 140, 0x000000, 0.5);
        this.add.text(this.cameras.main.centerX, 32, 'SCORE', { fontSize: '32px', align: 'center', color: '#fff' }).setOrigin(0.5);
        this.scoreText = this.add.text(this.cameras.main.centerX, 72, '0', { fontSize: '32px', align: 'center', color: '#fff' }).setOrigin(0.5);

        this.registry.set<number>(GameDataKeys.PlayerScore, 0);
        this.registry.events.on('changedata-' + GameDataKeys.PlayerScore, (_: any, value: number) => {
            this.scoreText.setText(value.toString());
        });
    }

    private restartGame() {
        // this.data.events.removeAllListeners();
        this.scene.start('GameOverScene');
    }

    private spawnEnemy() {
        if (this.enemies.countActive() >= 5) {
            return;
        }
        const enemy = (this.enemies.get() as Enemy);
        if (enemy) {
            enemy.enable(
                Phaser.Math.Between(0, this.cameras.main.width),
                0
            );
        }
    }


    update(_timeSinceLaunch: number, deltaTime: number) {

        this.bg.tilePositionY -= 0.1 * deltaTime;
        this.planet.y += 0.40 * deltaTime;
        this.planet2.y += 0.05 * deltaTime;

        this.bullets.getChildren().forEach(bullet => {
            if ((bullet as Bullet).y < -(bullet as Bullet).displayHeight) {
                bullet.destroy();
            }
        });
        this.enemies.getChildren().forEach(enemy => {
            if ((enemy as GameObjects.Rectangle).y >= this.cameras.main.height + (enemy as GameObjects.Rectangle).displayHeight) {
                enemy.destroy();
            }
        });
    }
}
