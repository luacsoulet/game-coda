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
    private orbitCenters: Map<Phaser.GameObjects.Sprite, [number, number]> = new Map();
    private orbitAngles: Map<Phaser.GameObjects.Sprite, number> = new Map();
    private orbitTweens: Map<Phaser.GameObjects.Sprite, Phaser.Tweens.Tween> = new Map();
    private orbitRadius: number = 28;

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

    update(time: number, delta: number) {
        this.bg.tilePositionY -= 0.1 * delta;

        // Mettre à jour les positions des vaisseaux en orbite
        this.updateOrbits();

        // Gestion des touches
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
        const centerX = this.cameras.main.centerX;
        const centerY = this.cameras.main.centerY;
        const offsetX = 200;
        const offsetY = 228;
        const duration = 500;

        // Réinitialiser les échelles avec animation
        [this.playerShip1, this.playerShip2, this.playerShip3].forEach((ship, index) => {
            const isSelected = this.selectedShip === index + 1;
            this.tweens.add({
                targets: ship,
                scale: isSelected ? 1.2 : 0.9,
                duration: 300,
                ease: 'Sine.easeInOut'
            });
        });

        // Positions cibles pour chaque vaisseau selon la sélection
        const centerPos: [number, number] = [centerX, centerY];
        const leftPos: [number, number] = [centerX - offsetX, centerY + offsetY];
        const rightPos: [number, number] = [centerX + offsetX, centerY + offsetY];

        // Tableau des positions cibles pour chaque vaisseau
        const targetPositions = [
            [centerPos, rightPos, leftPos],   // Pour selectedShip = 1
            [leftPos, centerPos, rightPos],   // Pour selectedShip = 2
            [leftPos, rightPos, centerPos]    // Pour selectedShip = 3
        ];

        // Sélectionner le bon ensemble de positions
        const positions = targetPositions[this.selectedShip - 1];
        const ships = [this.playerShip1, this.playerShip2, this.playerShip3];

        // Animer les centres d'orbite pour chaque vaisseau
        ships.forEach((ship, index) => {
            const currentCenter = this.orbitCenters.get(ship) || positions[index];
            const centerObj = { x: currentCenter[0], y: currentCenter[1] };

            this.tweens.add({
                targets: centerObj,
                x: positions[index][0],
                y: positions[index][1],
                duration: duration,
                ease: 'Sine.easeInOut',
                onUpdate: () => {
                    this.orbitCenters.set(ship, [centerObj.x, centerObj.y]);
                }
            });
        });

        // Initialiser les animations d'orbite si nécessaire
        if (!this.orbitAngles.has(this.playerShip1)) {
            ships.forEach((ship, index) => {
                this.orbitAngles.set(ship, 0);
            });
            this.startContinuousOrbits();
        }
    }

    private startContinuousOrbits() {
        // Créer des tweens pour animer les angles d'orbite
        const createOrbitTween = (sprite: Phaser.GameObjects.Sprite, duration: number) => {
            // Arrêter le tween existant s'il y en a un
            if (this.orbitTweens.has(sprite)) {
                this.orbitTweens.get(sprite)?.stop();
            }

            const tween = this.tweens.add({
                targets: { angle: this.orbitAngles.get(sprite) || 0 },
                angle: 360,
                duration: duration,
                repeat: -1,
                ease: 'Linear',
                onUpdate: (tween) => {
                    const target = tween.targets[0] as { angle: number };
                    this.orbitAngles.set(sprite, target.angle % 360);
                }
            });

            this.orbitTweens.set(sprite, tween);
        };

        // Créer des tweens avec des durées différentes
        createOrbitTween(this.playerShip1, 3000);
        createOrbitTween(this.playerShip2, 3500);
        createOrbitTween(this.playerShip3, 4000);
    }

    private updateOrbits() {
        // Mettre à jour la position de chaque vaisseau en fonction de son angle d'orbite
        this.orbitCenters.forEach((center, sprite) => {
            const angle = this.orbitAngles.get(sprite) || 0;
            const radian = Phaser.Math.DegToRad(angle);

            // Calculer la position cible sur l'orbite
            const targetX = center[0] + this.orbitRadius * Math.cos(radian);
            const targetY = center[1] + this.orbitRadius * Math.sin(radian);

            // Appliquer la position
            sprite.x = targetX;
            sprite.y = targetY;
        });
    }
}