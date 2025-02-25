import { GameObjects, Scene } from 'phaser';
import { Bullet } from '../entities/Bullet';
import { GroupUtils } from '../utils/GroupUtils';
import { Enemy } from '../entities/Enemy';
import { Player } from '../entities/Player';
export class Game extends Scene {
    private player: Phaser.GameObjects.Image;
    private playerShipData: PlayerShipData;
    private cursorKeys: Phaser.Types.Input.Keyboard.CursorKeys;
    private lastShotTime: number = 0;
    private playerRateOfFire: number = 0.5;
    private spaceKey: Phaser.Input.Keyboard.Key;
    private bullets: Phaser.Physics.Arcade.Group;
    private enemies: Phaser.Physics.Arcade.Group;
    private enemyBullets: Phaser.Physics.Arcade.Group;
    private leftKey: Phaser.Input.Keyboard.Key;
    private rightKey: Phaser.Input.Keyboard.Key;
    private playerScore: number = 0;
    private bg: Phaser.GameObjects.TileSprite;
    private planet: Phaser.GameObjects.Image;

    constructor() {
        super('Game');
    }


    preload() {
        this.load.setPath('assets');

        this.load.image('bg', 'Background/bg.png');
        this.load.image('planet', 'Planets/planet01.png');
        this.load.atlas('sprites', 'Spritesheet/gameSprites.png', 'Spritesheet/gameSprites.json');

        this.load.audio('sfx_laser1', 'Sounds/sfx_laser1.ogg');
        this.load.audio('sfx_laser2', 'Sounds/sfx_laser2.ogg');

        this.load.json('playerShips', 'Data/playerShips.json');
    }

    create() {

        this.bg = this.add.tileSprite(0, 0, this.cameras.main.width, this.cameras.main.height, 'bg').setOrigin(0).setTileScale(2);
        this.planet = this.add.image(0, -512, 'planet').setOrigin(0);

        const playerShipsData = this.cache.json.get('playerShips') as PlayerShipsData;
        this.playerShipData = playerShipsData["1"];

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

        const playerBody = this.player.body as Phaser.Physics.Arcade.Body;
        playerBody.setOffset(-1, -2);

        if (this.input.keyboard) {
            this.cursorKeys = this.input.keyboard.createCursorKeys();
            this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
            this.leftKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT);
            this.rightKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT);

            this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ONE).on('down', () => {
                this.selectPlayerShip(1);
            });
            this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.TWO).on('down', () => {
                this.selectPlayerShip(2);
            });
            this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.THREE).on('down', () => {
                this.selectPlayerShip(3);
            });
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

        this.physics.add.collider(this.bullets, this.enemies, (bullet, enemy) => {
            (enemy as Enemy).disable();
            (bullet as Bullet).disable();
            this.playerScore++;
            console.log("Score: " + this.playerScore);
        });

        this.physics.add.collider(this.enemyBullets, this.player, (enemyBullet, player) => {
            enemyBullet.destroy();
            player.destroy();
            this.scene.restart();
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

        this.playerScore = 0;
        this.lastShotTime = 0;
    }

    private restartGame() {
        this.scene.restart();
    }

    private selectPlayerShip(shipNumber: number) {
        const playerShipsData = this.cache.json.get('playerShips') as PlayerShipsData;
        this.playerShipData = playerShipsData[shipNumber];

        this.player.setTexture('sprites', this.playerShipData.texture);
    }

    private spawnEnemy() {
        if (this.enemies.getLength() >= 5) {
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
        // if (this.leftKey.isDown) {
        //     this.player.x -= this.playerShipData.movementSpeed * deltaTime;
        //     this.player.angle = Phaser.Math.Linear(this.player.angle, -105, 0.1);
        // }
        // else if (this.rightKey.isDown) {
        //     this.player.x += this.playerShipData.movementSpeed * deltaTime;
        //     this.player.angle = Phaser.Math.Linear(this.player.angle, -75, 0.1);
        // }
        // else {
        //     this.player.angle = Phaser.Math.Linear(this.player.angle, -90, 0.1);
        // }

        this.player.x = Phaser.Math.Clamp(this.player.x, this.player.displayWidth / 2, this.cameras.main.width - this.player.displayWidth / 2);
        this.player.y = Phaser.Math.Clamp(this.player.y, this.player.displayHeight / 2, this.cameras.main.height - this.player.displayHeight / 2);

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
