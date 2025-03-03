import { GameDataKeys } from '../GameDataKeys';

export class MainGameUiScene extends Phaser.Scene {

    private scoreText: Phaser.GameObjects.Text;

    constructor() {
        super('MainGameUiScene');
    }

    preload() {
        this.load.setPath('assets');
        this.load.atlas('sprites', 'Spritesheet/gameSprites.png', 'Spritesheet/gameSprites.json');
        this.load.image('meteors', 'Meteors/spaceMeteors_003.png');
        this.load.image('grey_square', 'Ui/grey_square.png');

    }

    create() {
        this.cameras.main.setBackgroundColor('rgba(0,0,0,0)');
        this.cameras.main.transparent = true;

        this.registry.set(GameDataKeys.PlayerScore, 0);

        this.displayShield();
        this.displayScore();
    }

    private displayShield() {
        const shieldBackgroundWidth = 230;
        const shieldBackgroundHeight = 60;
        const backgroundX = this.cameras.main.centerX - 400;
        const backgroundY = 52;

        const background = this.add.nineslice(
            backgroundX,
            backgroundY,
            'grey_square',
            undefined,
            shieldBackgroundWidth,
            shieldBackgroundHeight,
            8,
            8,
            8,
            8
        );

        const shieldSpacing = 40;
        const maxShields = 5;

        let shieldImages: Phaser.GameObjects.Image[] = [];

        for (let i = 0; i < maxShields; i++) {
            const shield = this.add.image(
                backgroundX - (shieldSpacing * (maxShields - 1) / 2) + (i * shieldSpacing),
                backgroundY,
                'sprites',
                'shield_gold.png'
            );
            shield.setScale(1.2);
            shield.setTint(0x555555);

            shieldImages.push(shield);
        }

        const currentShields = this.registry.get(GameDataKeys.PlayerShield) || 0;

        for (let i = 0; i < Math.min(currentShields, maxShields); i++) {
            shieldImages[i].clearTint();
        }

        this.registry.events.on('changedata-' + GameDataKeys.PlayerShield, (_: any, value: number) => {
            for (let i = 0; i < maxShields; i++) {
                if (i < value) {
                    shieldImages[i].clearTint();
                } else {
                    shieldImages[i].setTint(0x555555);
                }
            }
        });
    }

    private displayScore() {
        this.add.image(this.cameras.main.centerX + 450, 78, 'meteors', 'meteors.png').setScale(0.6).setAngle(-90);

        let starText = this.add.text(this.cameras.main.centerX + 440, 75, "0",
            { fontSize: '32px', align: 'center', color: '#fff' }).setOrigin(0.6);

        this.add.image(this.cameras.main.centerX + 485, 70, 'sprites', 'star_gold.png').setScale(1.5);

        this.registry.events.on('changedata-' + GameDataKeys.PlayerScore, (_: any, value: number) => {
            starText.setText(value.toString() + "x ");
        });
    }
}
