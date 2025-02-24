import { GameObjects, Scene } from 'phaser';

export class Game extends Scene
{
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

    constructor ()
    {
        super('Game');
    }


    preload ()
    {
        this.load.setPath('assets');
        
        this.load.image('bg', 'Background/bg.png');
        this.load.image('planet', 'Planets/planet01.png');
        this.load.atlas('sprites', 'Spritesheet/gameSprites.png', 'Spritesheet/gameSprites.json');

        this.load.audio('sfx_laser1', 'Sounds/sfx_laser1.ogg');
        this.load.audio('sfx_laser2', 'Sounds/sfx_laser2.ogg');

        this.load.json('playerShips', 'Data/playerShips.json');
    }

    create ()
    {
        const colorPalette = [
            0x020100,
            0x235789,
            0xC1292E,
            0xFDFFFC,
            0xF1D302,
        ];
        this.bg = this.add.tileSprite(0, 0, this.cameras.main.width, this.cameras.main.height, 'bg').setOrigin(0).setTileScale(2);
        this.planet = this.add.image(0, -512, 'planet').setOrigin(0);
        
        const playerShipsData = this.cache.json.get('playerShips') as PlayerShipsData;
        this.playerShipData = playerShipsData["1"];

        this.player = this.add.image(this.cameras.main.centerX, this.cameras.main.height - 128, 'sprites', this.playerShipData.texture).setAngle(-90).setOrigin(0.5);
        this.physics.add.existing(this.player);
        const playerBody = this.player.body as Phaser.Physics.Arcade.Body;
        playerBody.setOffset(-1, -2);

        if(this.input.keyboard){
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
        }
        else{
            console.log('no keyboard input');
        }

        this.bullets = this.physics.add.group();
        this.enemies = this.physics.add.group();
        this.enemyBullets = this.physics.add.group();

        this.physics.add.collider(this.bullets, this.enemies, (bullet, enemy) => {
            bullet.destroy();
            enemy.destroy();
            this.playerScore++;
            console.log("Score: " + this.playerScore);
        });

        this.physics.add.collider(this.enemyBullets, this.player, (enemyBullet, player) => {
            enemyBullet.destroy();
            player.destroy();
        });

        this.anims.create({
            key:'ufoShoot',
            frames: [
                { key: 'sprites', frame: 'ufoRed.png' },
                { key: 'sprites', frame: 'ufoRed-shoot2.png' },
                { key: 'sprites', frame: 'ufoRed-shoot3.png' },
            ],
            frameRate: 4,
        })

        this.time.addEvent({
            delay: 1500,
            callback: this.spawnEnemy,
            callbackScope: this,
            loop: true,
        });

        this.playerScore = 0;
        this.lastShotTime = 0;
    }

    private selectPlayerShip(shipNumber: number){
        const playerShipsData = this.cache.json.get('playerShips') as PlayerShipsData;
        this.playerShipData = playerShipsData[shipNumber];

        this.player.setTexture('sprites', this.playerShipData.texture);
    }

    private spawnEnemy(){
        if(this.enemies.getLength() >= 5){
            return;
        }
        const enemySize: number= 32;
        let enemy: Phaser.GameObjects.Sprite = this.add.sprite(Phaser.Math.Between(enemySize, this.cameras.main.width - enemySize), -enemySize / 2, 'sprites', 'ufoRed.png').setDepth(100);
        this.enemies.add(enemy);
        let enemyBody: Phaser.Physics.Arcade.Body = enemy.body as Phaser.Physics.Arcade.Body;
        enemyBody.allowGravity = false;
        enemyBody.setFriction(0,0);
        enemyBody.setVelocityY(256);

        this.time.addEvent({
            delay: 1500,
            callback: () => {
                if (enemy.active){
                    enemy.play('ufoShoot');
                    enemy.once(Phaser.Animations.Events.ANIMATION_COMPLETE, () => {
                        enemy.setTexture('sprites', 'ufoRed.png');
                        let bullet: Phaser.GameObjects.Rectangle = this.add.rectangle(enemy.x, enemy.y, 4, 13, 0xFDFFFC).setOrigin(0.5);
                        this.enemyBullets.add(bullet);
                        let bulletBody: Phaser.Physics.Arcade.Body = bullet.body as Phaser.Physics.Arcade.Body;
                        bulletBody.allowGravity = false;
                        bulletBody.setFriction(0,0);
                        bulletBody.setVelocityY(512);
                        this.sound.play('sfx_laser2');
                    });
                }
            },
            callbackScope: this,
            loop: true,
        });
    }
    

    update(_timeSinceLaunch: number, deltaTime: number)
    {
        const colorPalette = [
            0x020100,
            0x235789,
            0xC1292E,
            0xFDFFFC,
            0xF1D302,
        ];

        this.bg.tilePositionY -= 0.1 * deltaTime;
        this.planet.y += 0.40 * deltaTime;
        if(this.leftKey.isDown){
            this.player.x -= this.playerShipData.movementSpeed * deltaTime;
        }
        else if(this.rightKey.isDown){
            this.player.x += this.playerShipData.movementSpeed * deltaTime;
        }

        if( this.player.active && this.spaceKey.isDown && _timeSinceLaunch - this.lastShotTime > this.playerRateOfFire * 1000){
            let bullet: Phaser.GameObjects.Rectangle = this.add.rectangle(this.player.x, this.player.y - this.player.displayHeight / 2, 4, 13, colorPalette[2]).setOrigin(0.5);
            this.bullets.add(bullet);
            let bulletBody: Phaser.Physics.Arcade.Body = bullet.body as Phaser.Physics.Arcade.Body;
            bulletBody.allowGravity = false;
            bulletBody.setFriction(0,0);
            bulletBody.setVelocityY(-1024);

            this.lastShotTime = _timeSinceLaunch;
            this.sound.play('sfx_laser1');
        }

        this.player.x = Phaser.Math.Clamp(this.player.x, this.player.displayWidth / 2, this.cameras.main.width - this.player.displayWidth / 2);
        this.player.y = Phaser.Math.Clamp(this.player.y, this.player.displayHeight / 2, this.cameras.main.height - this.player.displayHeight / 2);

        this.bullets.getChildren().forEach(bullet => {
            if ((bullet as GameObjects.Rectangle).y < -(bullet as GameObjects.Rectangle).displayHeight){
                bullet.destroy();
            }
        });
        this.enemies.getChildren().forEach(enemy => {
            if ((enemy as GameObjects.Rectangle).y >= this.cameras.main.height + (enemy as GameObjects.Rectangle).displayHeight){
                enemy.destroy();
            }
        });
        this.enemyBullets.getChildren().forEach(bullet => {
            if ((bullet as GameObjects.Rectangle).y > this.cameras.main.height + (bullet as GameObjects.Rectangle).displayHeight) {
                bullet.destroy();
            }
        });
    }
}
