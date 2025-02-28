import { Enemy } from "../entities/Enemy";
import { FormationFile } from "../gameData/FormationData";

export class FormationManager {
    private scene: Phaser.Scene;
    private formations: FormationFile;
    private enemies: Phaser.GameObjects.Group;
    private enemyBullets: Phaser.Physics.Arcade.Group;

    constructor(scene: Phaser.Scene, enemies: Phaser.GameObjects.Group, enemyBullets: Phaser.Physics.Arcade.Group) {
        this.scene = scene;
        this.enemies = enemies;
        this.enemyBullets = enemyBullets;
        this.formations = this.scene.cache.json.get('formations');
    }

    public spawnFormation(formationType: string, x: number, y: number, enemyType?: string) {
        if (!this.formations || !this.formations[formationType]) {
            console.error(`Formation type ${formationType} not found`);
            return;
        }

        const formation = this.formations[formationType];
        const count = formation.count || 1;
        const type = enemyType || formation.enemyType || 'swarm';

        switch (formation.type) {
            case 'default':
                if (type === 'shooter' || type === 'saucer') {
                    this.spawnDefaultFormation(x, y, count, type);
                } else {
                    this.spawnLineFormation(x, y, count, type, formation.spacing || 50);
                }
                break;
            case 'line':
                this.spawnLineFormation(x, y, count, type, formation.spacing || 50);
                break;
            case 'circle':
                this.spawnCircleFormation(x, y, count, type, formation.radius || 100);
                break;
            case 'triangle':
                this.spawnTriangleFormation(x, y, count, type, formation.spacing || 50);
                break;
            case 'square':
                this.spawnSquareFormation(x, y, count, type, formation.spacing || 50);
                break;
            case 'zigzag':
                this.spawnZigzagFormation(x, y, count, type, formation.spacing || 50);
                break;
            default:
                console.error(`Unknown formation type: ${formation.type}`);
        }
    }

    private createEnemy(x: number, y: number, type: string): Enemy {
        const enemy = this.enemies.get() as Enemy;
        if (enemy) {
            if (!enemy.isInitialized()) {
                enemy.init(this.enemyBullets);
            }
            enemy.enable(x, y, type);
        }
        return enemy;
    }

    private spawnDefaultFormation(x: number, y: number, count: number, type: string) {
        if (type === 'saucer') {
            const margin = 50;

            for (let i = 0; i < count; i++) {
                const randomX = Phaser.Math.Between(margin, this.scene.cameras.main.width - margin);
                // Garder le même décalage vertical pour tous les ennemis
                const randomY = y + Phaser.Math.Between(0, 100);
                this.createEnemy(randomX, randomY, type);
            }
        } else {
            for (let i = 0; i < count; i++) {
                this.createEnemy(x, y, type);
            }
        }
    }

    private spawnLineFormation(x: number, y: number, count: number, type: string, spacing: number) {
        const startX = x - ((count - 1) * spacing) / 2;

        for (let i = 0; i < count; i++) {
            const enemyX = startX + (i * spacing);
            this.createEnemy(enemyX, y, type);
        }
    }

    private spawnCircleFormation(x: number, y: number, count: number, type: string, radius: number) {
        const circle = new Phaser.Geom.Circle(x, y, radius);
        const points = circle.getPoints(count);

        for (let i = 0; i < points.length; i++) {
            this.createEnemy(points[i].x, points[i].y, type);
        }
    }

    private spawnTriangleFormation(x: number, y: number, count: number, type: string, spacing: number) {
        let totalEnemies = 0;
        let rows = 0;

        while (totalEnemies < count) {
            rows++;
            totalEnemies += rows;
        }

        let remainingEnemies = count;
        let currentY = y;

        for (let row = 1; row <= rows; row++) {
            if (remainingEnemies <= 0) break;

            const enemiesInRow = Math.min(row, remainingEnemies);
            remainingEnemies -= enemiesInRow;

            const startX = x - ((enemiesInRow - 1) * spacing) / 2;

            for (let i = 0; i < enemiesInRow; i++) {
                const enemyX = startX + (i * spacing);
                this.createEnemy(enemyX, currentY, type);
            }

            currentY += spacing;
        }
    }

    private spawnSquareFormation(x: number, y: number, count: number, type: string, spacing: number) {
        const side = Math.ceil(Math.sqrt(count));
        const startX = x - ((side - 1) * spacing) / 2;
        const startY = y - ((side - 1) * spacing) / 2;

        let enemiesCreated = 0;

        for (let row = 0; row < side; row++) {
            for (let col = 0; col < side; col++) {
                if (enemiesCreated >= count) return;

                const enemyX = startX + (col * spacing);
                const enemyY = startY + (row * spacing);

                this.createEnemy(enemyX, enemyY, type);
                enemiesCreated++;
            }
        }
    }

    private spawnZigzagFormation(x: number, y: number, count: number, type: string, spacing: number) {
        const startX = x - ((count - 1) * spacing) / 2;

        for (let i = 0; i < count; i++) {
            const enemyX = startX + (i * spacing);
            const enemyY = y + (i % 2 === 0 ? -spacing / 2 : spacing / 2);

            this.createEnemy(enemyX, enemyY, type);
        }
    }

    public spawnRandomFormation(enemyType?: string) {
        if (!this.formations) {
            console.error("Formations data not loaded");
            return;
        }

        const formationTypes = Object.keys(this.formations).filter(type => type !== 'default');

        if (formationTypes.length === 0) {
            console.error("No formations available");
            return;
        }

        const randomType = formationTypes[Math.floor(Math.random() * formationTypes.length)];

        const x = Phaser.Math.Between(100, this.scene.cameras.main.width - 100);
        const y = Phaser.Math.Between(50, 150);

        const type = enemyType || (() => {
            const enemyTypes = ['swarm', 'saucer', 'shooter'];
            return enemyTypes[Math.floor(Math.random() * enemyTypes.length)];
        })();

        console.log(`Spawning random formation: ${randomType} with enemy type: ${type} at (${x}, ${y})`);
        this.spawnFormation(randomType, x, y, type);
    }
} 