import { GameDataKeys } from '../GameDataKeys';

export class MainMenuScene extends Phaser.Scene {

    constructor() {
        super('MainMenuScene');
    }

    private bg: Phaser.GameObjects.TileSprite;
    private playerShip1: Phaser.GameObjects.Sprite;
    private playerShip2: Phaser.GameObjects.Sprite;
    private playerShip3: Phaser.GameObjects.Sprite;
    private angle: number = 0;
    private cursorKeys: Phaser.Types.Input.Keyboard.CursorKeys;
    private selectedShip: number = 1;

    preload() {
        this.load.setPath('assets');

        this.load.image('bg', 'Background/bg.png');
        this.load.atlas('sprites', 'Spritesheet/gameSprites.png', 'Spritesheet/gameSprites.json');

        this.load.font('font', 'Fonts/kenvector_future.ttf');
    }

    create() {
        this.bg = this.add.tileSprite(0, 0, this.cameras.main.width, this.cameras.main.height, 'bg').setOrigin(0).setTileScale(2);

        const playerShipOffsetX = 200;

        this.playerShip1 = this.add.sprite(this.cameras.main.centerX - playerShipOffsetX, this.cameras.main.centerY + 228, 'sprites', 'playerShip1_blue.png');
        this.playerShip2 = this.add.sprite(this.cameras.main.centerX + playerShipOffsetX, this.cameras.main.centerY + 228, 'sprites', 'playerShip2_blue.png');
        this.playerShip3 = this.add.sprite(this.cameras.main.centerX, this.cameras.main.centerY, 'sprites', 'playerShip3_blue.png');


        // Création des animations pour les vaisseaux de façon factorisée
        for (let i = 1; i <= 3; i++) {

            (this as any)[`playerShip${i}`].setAngle(-90);

            this.anims.create({
                key: `playerShipIdle_${i}`,
                frames: [
                    { key: 'sprites', frame: `playerShip${i}_blue.png` },
                    { key: 'sprites', frame: `playerShip${i}_blue_boost.png` },
                ],
                frameRate: 30,
                repeat: -1,
            });

            (this as any)[`playerShip${i}`].play(`playerShipIdle_${i}`);
        }

        this.cameras.main.setBackgroundColor('#000');

        this.add.text(this.cameras.main.centerX, 256, 'Main Menu', { fontSize: '64px', color: '#fff', fontFamily: 'font' }).setOrigin(0.5);
        this.add.text(this.cameras.main.centerX, this.cameras.main.height - 200, 'Press SPACE to play', { fontSize: '34px', color: '#fff', fontFamily: 'font' }).setOrigin(0.5);
        this.add.text(this.cameras.main.centerX, this.cameras.main.height - 356, 'Use arrows to select and SPACE to play', { fontSize: '24px', color: '#fff', fontFamily: 'font' }).setOrigin(0.5);

        this.input.keyboard?.once('keydown-SPACE', () => {
            this.scene.start('MainGameScene', { selectedShip: this.selectedShip });
        });

        if (this.input.keyboard) {
            this.cursorKeys = this.input.keyboard.createCursorKeys();
        }

        this.registry.set(GameDataKeys.SelectedShip, this.selectedShip);

        this.highlightSelectedShip();
    }

    update(_timeSinceLaunch: number, deltaTime: number) {
        this.bg.tilePositionY -= 0.1 * deltaTime;

        if (Phaser.Input.Keyboard.JustDown(this.cursorKeys.left)) {
            this.selectedShip = this.selectedShip === 1 ? 3 : this.selectedShip - 1;
            this.registry.set(GameDataKeys.SelectedShip, this.selectedShip);
            this.highlightSelectedShip();
        }
        if (Phaser.Input.Keyboard.JustDown(this.cursorKeys.right)) {
            this.selectedShip = this.selectedShip === 3 ? 1 : this.selectedShip + 1;
            this.registry.set(GameDataKeys.SelectedShip, this.selectedShip);
            this.highlightSelectedShip();
        }
    }

    private highlightSelectedShip() {
        this.tweens.killAll();

        this.playerShip1.setScale(1);
        this.playerShip2.setScale(1);
        this.playerShip3.setScale(1);

        const centerX = this.cameras.main.centerX;
        const centerY = this.cameras.main.centerY;
        const offsetX = 200;
        const offsetY = 228;
        const duration = 500;

        this.angle = 0;

        switch (this.selectedShip) {
            case 1:
                this.playerShip1.setScale(1.2);
                this.tweens.add({
                    targets: this.playerShip1,
                    x: centerX,
                    y: centerY,
                    duration: duration,
                    ease: 'Power2'
                });
                this.playerShip2.setScale(0.9);
                this.tweens.add({
                    targets: this.playerShip2,
                    x: centerX + offsetX,
                    y: centerY + offsetY,
                    duration: duration,
                    ease: 'Power2'
                });
                this.playerShip3.setScale(0.9);
                this.tweens.add({
                    targets: this.playerShip3,
                    x: centerX - offsetX,
                    y: centerY + offsetY,
                    duration: duration,
                    ease: 'Power2',
                    onComplete: () => {
                        this.addCircularMotions(
                            [centerX, centerY],
                            [centerX + offsetX, centerY + offsetY],
                            [centerX - offsetX, centerY + offsetY]
                        );
                    }
                });
                break;
            case 2:
                this.playerShip2.setScale(1.2);
                this.tweens.add({
                    targets: this.playerShip2,
                    x: centerX,
                    y: centerY,
                    duration: duration,
                    ease: 'Power2'
                });
                this.playerShip1.setScale(0.9);
                this.tweens.add({
                    targets: this.playerShip1,
                    x: centerX - offsetX,
                    y: centerY + offsetY,
                    duration: duration,
                    ease: 'Power2'
                });
                this.playerShip3.setScale(0.9);
                this.tweens.add({
                    targets: this.playerShip3,
                    x: centerX + offsetX,
                    y: centerY + offsetY,
                    duration: duration,
                    ease: 'Power2',
                    onComplete: () => {
                        this.addCircularMotions(
                            [centerX - offsetX, centerY + offsetY],
                            [centerX, centerY],
                            [centerX + offsetX, centerY + offsetY]
                        );
                    }
                });
                break;
            case 3:
                this.playerShip3.setScale(1.2);
                this.tweens.add({
                    targets: this.playerShip3,
                    x: centerX,
                    y: centerY,
                    duration: duration,
                    ease: 'Power2'
                });
                this.playerShip1.setScale(0.9);
                this.tweens.add({
                    targets: this.playerShip1,
                    x: centerX - offsetX,
                    y: centerY + offsetY,
                    duration: duration,
                    ease: 'Power2'
                });
                this.playerShip2.setScale(0.9);
                this.tweens.add({
                    targets: this.playerShip2,
                    x: centerX + offsetX,
                    y: centerY + offsetY,
                    duration: duration,
                    ease: 'Power2',
                    onComplete: () => {
                        this.addCircularMotions(
                            [centerX - offsetX, centerY + offsetY],
                            [centerX + offsetX, centerY + offsetY],
                            [centerX, centerY]
                        );
                    }
                });
                break;
        }
    }

    private addCircularMotions(ship1Pos: [number, number], ship2Pos: [number, number], ship3Pos: [number, number]) {
        const radius = 28;
        const ships = [
            { sprite: this.playerShip1, position: ship1Pos, duration: 4000 },
            { sprite: this.playerShip2, position: ship2Pos, duration: 3500 },
            { sprite: this.playerShip3, position: ship3Pos, duration: 3000 }
        ];

        // Créer les animations circulaires pour chaque vaisseau
        ships.forEach(ship => {
            const angle = { value: 0 };

            this.tweens.add({
                targets: angle,
                value: 360,
                duration: ship.duration,
                repeat: -1,
                ease: 'Linear',
                onUpdate: () => {
                    const radian = Phaser.Math.DegToRad(angle.value);
                    ship.sprite.x = ship.position[0] + radius * Math.cos(radian);
                    ship.sprite.y = ship.position[1] + radius * Math.sin(radian);
                }
            });
        });
    }
}