import { GameDataKeys } from "../GameDataKeys";

export class GameOverUiScene extends Phaser.Scene {

    constructor() {
        super('GameOverUiScene');
    }

    preload() {
        this.load.setPath('assets');
        this.load.atlas('sprites', 'Spritesheet/gameSprites.png', 'Spritesheet/gameSprites.json');
    }

    create() {
        this.cameras.main.setBackgroundColor('rgba(0,0,0,0)');
        this.cameras.main.transparent = true;

        this.add.text(this.cameras.main.centerX, this.cameras.main.centerY - 100, 'Game Over',
            { fontSize: '96px', color: '#ff0000', fontFamily: 'font' }).setOrigin(0.5);

        const score = this.registry.get(GameDataKeys.PlayerScore) || 0;
        this.add.text(this.cameras.main.centerX, this.cameras.main.centerY,
            'Your score: ' + score,
            { fontSize: '48px', color: '#fff', fontFamily: 'font' }).setOrigin(0.5);

        const playAgainText = this.add.text(
            this.cameras.main.centerX,
            this.cameras.main.height - 140,
            'Press SPACE to play again',
            { fontSize: '34px', color: '#fff', fontFamily: 'font' }
        ).setOrigin(0.5);

        this.tweens.add({
            targets: playAgainText,
            scale: { from: 1, to: 1.1 },
            duration: 900,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
    }

    private createBlinkingText(x: number, y: number, text: string) {
        const textObject = this.add.text(x, y, text,
            { fontSize: '48px', color: '#ff0000', fontFamily: 'font' }).setOrigin(0.5);

        this.tweens.add({
            targets: textObject,
            alpha: { from: 1, to: 0.2 },
            duration: 800,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        return textObject;
    }
} 