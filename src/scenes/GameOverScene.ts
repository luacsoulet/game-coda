import { GameOverUiScene } from './GameOverUiScene';

export class GameOverScene extends Phaser.Scene {

    constructor() {
        super('GameOverScene');
    }

    create() {
        this.cameras.main.setBackgroundColor('#000');

        this.scene.add('GameOverUiScene', GameOverUiScene);
        this.scene.launch('GameOverUiScene');
        this.scene.remove('MainGameUiScene');

        this.input.keyboard?.once('keydown-SPACE', () => {
            this.scene.start('MainMenuScene');
        });
    }
}