export class MainMenuScene extends Phaser.Scene {

    constructor() {
        super('MainMenuScene');
    }

    create() {
        this.cameras.main.setBackgroundColor('#000');
        this.add.text(this.cameras.main.centerX, this.cameras.main.centerY, 'Main Menu', { fontSize: '64px', color: '#fff' }).setOrigin(0.5);
        this.add.text(this.cameras.main.centerX, this.cameras.main.centerY + 100, 'Press SPACE to play', { fontSize: '64px', color: '#fff' }).setOrigin(0.5);

        this.input.keyboard?.once('keydown-SPACE', () => {
            this.scene.start('MainGameScene');
        });
    }

}