import { GameDataKeys } from '../GameDataKeys';

export class MainMenuUiScene extends Phaser.Scene {

    constructor() {
        super('MainMenuUiScene');
    }

    preload() {
        this.load.setPath('assets');
        this.load.atlas('sprites', 'Spritesheet/gameSprites.png', 'Spritesheet/gameSprites.json');
        this.load.image('grey_square', 'Ui/grey_square.png');
    }

    create() {
        this.cameras.main.setBackgroundColor('rgba(0,0,0,0)');
        this.cameras.main.transparent = true;
        this.add.text(this.cameras.main.centerX, 256, 'Main Menu', { fontSize: '64px', color: '#fff', fontFamily: 'font' }).setOrigin(0.5);

        const spaceBar = this.add.image(this.cameras.main.centerX, this.cameras.main.height - 200, 'sprites', 'spaceBar.png').setScale(0.5);

        this.tweens.add({
            targets: spaceBar,
            scaleX: { from: 0.5, to: 0.55 },
            scaleY: { from: 0.5, to: 0.55 },
            duration: 900,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        this.createArrowsWithAnimation();

        this.displayShipsInfo();
    }

    private createArrowsWithAnimation() {
        const centerX = this.cameras.main.centerX;
        const y = this.cameras.main.height - 356;

        const leftArrow = this.add.image(centerX - 200, y - 800, 'sprites', 'arrows.png').setAngle(-90).setScale(0.1);
        const rightArrow = this.add.image(centerX + 200, y - 800, 'sprites', 'arrows.png').setAngle(90).setScale(0.1);

        this.tweens.add({
            targets: [leftArrow, rightArrow],
            scaleX: { from: 0.3, to: 0.35 },
            scaleY: { from: 0.3, to: 0.35 },
            duration: 800,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
    }

    private displayShipsInfo() {
        const backgroundX = this.cameras.main.centerX;
        const backgroundY = this.cameras.main.centerY + 250;

        this.add.image(backgroundX - 80, backgroundY - 50, 'sprites', 'bold_silver.png').setScale(1.2);
        const speedText = this.add.text(
            backgroundX - 20,
            backgroundY - 50,
            " 0",
            { fontSize: '30px', color: '#ffffff' }
        ).setOrigin(0, 0.5);

        this.add.image(backgroundX - 80, backgroundY, 'sprites', 'shield_silver.png').setScale(1.2);
        const shieldText = this.add.text(
            backgroundX - 20,
            backgroundY,
            " 0",
            { fontSize: '30px', color: '#ffffff' }
        ).setOrigin(0, 0.5);

        this.add.image(backgroundX - 80, backgroundY + 50, 'sprites', 'things_silver.png').setScale(1.2);
        const shootRateText = this.add.text(
            backgroundX - 20,
            backgroundY + 50,
            " 0",
            { fontSize: '30px', color: '#ffffff' }
        ).setOrigin(0, 0.5);

        this.updateShipStats(speedText, shieldText, shootRateText);

        const updateStatsHandler = () => {
            this.updateShipStats(speedText, shieldText, shootRateText);
        };

        this.registry.events.on('changedata-' + GameDataKeys.SelectedShip, updateStatsHandler);

        this.events.once('shutdown', () => {
            this.registry.events.off('changedata-' + GameDataKeys.SelectedShip, updateStatsHandler);
        });
    }

    private updateShipStats(speedText: Phaser.GameObjects.Text, shieldText: Phaser.GameObjects.Text, shootRateText: Phaser.GameObjects.Text) {
        if (!speedText || !shieldText || !shootRateText) {
            this.registry.events.off('changedata-' + GameDataKeys.SelectedShip, this.updateShipStats, this);
            return;
        }

        let speed = 0;
        let shield = 0;
        let shootRate = 0;

        if (this.registry.get(GameDataKeys.SelectedShip) === 1) {
            speed = 0.9;
            shield = 5;
            shootRate = 0.5;
        }
        else if (this.registry.get(GameDataKeys.SelectedShip) === 2) {
            speed = 0.6;
            shield = 3;
            shootRate = 0.7;
        } else if (this.registry.get(GameDataKeys.SelectedShip) === 3) {
            speed = 1.2;
            shield = 1;
            shootRate = 0.9;
        }

        const maxSpeed = 1.2;
        const maxShield = 5;
        const maxShootRate = 0.9;

        const speedBars = Math.round((speed / maxSpeed) * 5);
        const shieldBars = Math.round((shield / maxShield) * 5);
        const shootRateBars = Math.round((shootRate / maxShootRate) * 5);

        const barFull = "■";
        const barEmpty = "□";

        const createBarDisplay = (value: number) => {
            return barFull.repeat(value) + barEmpty.repeat(5 - value);
        };

        try {
            speedText.setText(`${createBarDisplay(speedBars)}`);
            shieldText.setText(`${createBarDisplay(shieldBars)}`);
            shootRateText.setText(`${createBarDisplay(shootRateBars)}`);
        } catch (error) {
            console.warn("Erreur lors de la mise à jour des statistiques du vaisseau:", error);
            this.registry.events.off('changedata-' + GameDataKeys.SelectedShip, this.updateShipStats, this);
        }
    }
}