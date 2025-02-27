import { GameDataKeys } from "../GameDataKeys";

export class GameOverScene extends Phaser.Scene {

    constructor() {
        super('GameOverScene');
    }

    create() {
        this.cameras.main.setBackgroundColor('#000');
        this.add.text(this.cameras.main.centerX, this.cameras.main.centerY - 800, 'Your score: ' + this.registry.get(GameDataKeys.PlayerScore), { fontSize: '40px', color: '#fff' }).setOrigin(0.5);
        this.add.text(this.cameras.main.centerX, this.cameras.main.centerY, 'Game Over', { fontSize: '96px', color: '#fff' }).setOrigin(0.5);
        this.add.text(this.cameras.main.centerX, this.cameras.main.centerY + 800, 'Press SPACE to play again', { fontSize: '34px', color: '#fff' }).setOrigin(0.5);

        this.input.keyboard?.once('keydown-SPACE', () => {
            this.scene.start('MainMenuScene');
        });
    }

}