export class MainMenuScene extends Phaser.Scene {

    constructor() {
        super('MainMenuScene');
    }

    private bg: Phaser.GameObjects.TileSprite;
    private playerShip1: Phaser.GameObjects.Sprite;
    private playerShip2: Phaser.GameObjects.Sprite;
    private playerShip3: Phaser.GameObjects.Sprite;
    private angle: number = 0;
    preload() {
        this.load.setPath('assets');

        this.load.image('bg', 'Background/bg.png');
        this.load.atlas('sprites', 'Spritesheet/gameSprites.png', 'Spritesheet/gameSprites.json');

        this.load.font('font', 'Fonts/kenvector_future.ttf');
    }

    create() {
        this.bg = this.add.tileSprite(0, 0, this.cameras.main.width, this.cameras.main.height, 'bg').setOrigin(0).setTileScale(2);

        const playerShipOffsetX = 200;
        this.playerShip1 = this.add.sprite(this.cameras.main.centerX, this.cameras.main.centerY, 'sprites', 'playerShip1_blue.png');
        this.playerShip1.setAngle(-90);

        this.playerShip2 = this.add.sprite(this.cameras.main.centerX + playerShipOffsetX, this.cameras.main.centerY + 228, 'sprites', 'playerShip2_blue.png');
        this.playerShip2.setAngle(-90);

        this.playerShip3 = this.add.sprite(this.cameras.main.centerX - playerShipOffsetX, this.cameras.main.centerY + 228, 'sprites', 'playerShip3_blue.png');
        this.playerShip3.setAngle(-90);

        this.anims.create({
            key: 'playerShipIdle_1',
            frames: [
                { key: 'sprites', frame: 'playerShip1_blue.png' },
                { key: 'sprites', frame: 'playerShip1_blue_boost.png' },
            ],
            frameRate: 30,
            repeat: -1,
        });
        this.anims.create({
            key: 'playerShipIdle_2',
            frames: [
                { key: 'sprites', frame: 'playerShip2_blue.png' },
                { key: 'sprites', frame: 'playerShip2_blue_boost.png' },
            ],
            frameRate: 30,
            repeat: -1,
        });
        this.anims.create({
            key: 'playerShipIdle_3',
            frames: [
                { key: 'sprites', frame: 'playerShip3_blue.png' },
                { key: 'sprites', frame: 'playerShip3_blue_boost.png' },
            ],
            frameRate: 30,
            repeat: -1,
        });

        this.playerShip1.play('playerShipIdle_1');
        this.playerShip2.play('playerShipIdle_2');
        this.playerShip3.play('playerShipIdle_3');

        const radius = 28; // Rayon du mouvement circulaire

        this.tweens.add({
            targets: this,
            angle: 360,
            duration: 4000,
            repeat: -1,
            ease: 'Sine.ease',
            onUpdate: () => {
                const radian = Phaser.Math.DegToRad(this.angle);
                this.playerShip1.x = this.cameras.main.centerX + radius * Math.cos(radian);
                this.playerShip1.y = this.cameras.main.centerY + radius * Math.sin(radian);
            }
        });

        this.tweens.add({
            targets: this,
            angle: 360,
            duration: 3500,
            repeat: -1,
            ease: 'Sine.ease',
            onUpdate: () => {
                const radian = Phaser.Math.DegToRad(this.angle);
                this.playerShip2.x = (this.cameras.main.centerX + playerShipOffsetX) + radius * Math.cos(radian);
                this.playerShip2.y = (this.cameras.main.centerY + 228) + radius * Math.sin(radian);
            }
        });

        this.tweens.add({
            targets: this,
            angle: 360,
            duration: 3000,
            repeat: -1,
            ease: 'Sine.ease',
            onUpdate: () => {
                const radian = Phaser.Math.DegToRad(this.angle);
                this.playerShip3.x = (this.cameras.main.centerX - playerShipOffsetX) + radius * Math.cos(radian);
                this.playerShip3.y = (this.cameras.main.centerY + 228) + radius * Math.sin(radian);
            }
        });

        // COLOR CHANGING
        // this.tweens.add({
        //     targets: this.playerShip,
        //     tint: 0x000,
        //     duration: 800,
        //     yoyo: true,
        //     repeat: -1,
        //     ease: 'Quad.easeInOut',
        // });

        this.cameras.main.setBackgroundColor('#000');

        this.add.text(this.cameras.main.centerX, 256, 'Main Menu', { fontSize: '64px', color: '#fff', fontFamily: 'font' }).setOrigin(0.5);
        this.add.text(this.cameras.main.centerX, this.cameras.main.height - 256, 'Press SPACE to play', { fontSize: '34px', color: '#fff', fontFamily: 'font' }).setOrigin(0.5);

        this.input.keyboard?.once('keydown-SPACE', () => {
            this.scene.start('MainGameScene');
        });
    }
    update(_timeSinceLaunch: number, deltaTime: number) {
        this.bg.tilePositionY -= 0.1 * deltaTime;
    }

}