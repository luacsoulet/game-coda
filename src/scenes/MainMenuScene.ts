export class MainMenuScene extends Phaser.Scene {

    constructor() {
        super('MainMenuScene');
    }

    private bg: Phaser.GameObjects.TileSprite;
    private playerShip: Phaser.GameObjects.Image;

    preload() {
        this.load.setPath('assets');

        this.load.image('bg', 'Background/bg.png');
        this.load.atlas('sprites', 'Spritesheet/gameSprites.png', 'Spritesheet/gameSprites.json');
    }

    create() {
        this.bg = this.add.tileSprite(0, 0, this.cameras.main.width, this.cameras.main.height, 'bg').setOrigin(0).setTileScale(2);

        const playerShipOffsetX = 64;
        this.playerShip = this.add.image(this.cameras.main.centerX - playerShipOffsetX, this.cameras.main.centerY, 'sprites', 'playerShip1_blue.png');

        this.playerShip.setAngle(-90);

        this.tweens.add({
            targets: this.playerShip,
            x: this.cameras.main.centerX + playerShipOffsetX,
            duration: 1000,
            yoyo: true,
            repeat: -1,
            ease: 'Quad.easeInOut',
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

        this.add.text(this.cameras.main.centerX, 256, 'Main Menu', { fontSize: '64px', color: '#fff' }).setOrigin(0.5);
        this.add.text(this.cameras.main.centerX, this.cameras.main.height - 256, 'Press SPACE to play', { fontSize: '34px', color: '#fff' }).setOrigin(0.5);

        this.input.keyboard?.once('keydown-SPACE', () => {
            this.scene.start('MainGameScene');
        });
    }
    update(_timeSinceLaunch: number, deltaTime: number) {
        this.bg.tilePositionY -= 0.1 * deltaTime;
    }

}