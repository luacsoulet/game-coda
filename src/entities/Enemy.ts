import { Entity } from "./Entity";
import { WeaponComponent } from "../components/WeaponComponent";
import { MovementComponent } from "../components/MovementComponent";
import { HealthComponent } from "../components/HealthComponent";

export class Enemy extends Entity {
    private shootTimer: Phaser.Time.TimerEvent;
    private shootTimerConfig: Phaser.Types.Time.TimerEventConfig;
    private enemyType: string;
    private enemyData: any;
    private formationData: any = null;
    private idleAnimation: Phaser.Animations.Animation;

    constructor(scene: Phaser.Scene, x: number, y: number, texture: string, frame?: string | number) {
        super(scene, x, y, texture, frame as string);
        this.enemyType = 'saucer'; // Type par défaut
    }

    public init(bulletsGroup: Phaser.Physics.Arcade.Group, enemyType?: string) {
        // Si un type d'ennemi est spécifié, l'utiliser
        if (enemyType) {
            this.enemyType = enemyType;
        }

        this.angle = 90;

        // Charger les données de l'ennemi depuis le fichier JSON
        this.loadEnemyData();

        // Configurer le corps en fonction des données
        this.setupBody();

        // Configurer les composants en fonction des données
        this.setupComponents(bulletsGroup);

        // Configurer le timer de tir
        this.setupShootTimer();

        // Configurer les animations
        this.setupAnimations();
    }

    private loadEnemyData() {
        // Charger les données depuis le cache JSON
        const enemiesData = this.scene.cache.json.get('enemies');
        console.log("Enemies data:", enemiesData);

        if (enemiesData && enemiesData[this.enemyType]) {
            this.enemyData = enemiesData[this.enemyType];
        } else {
            console.warn(`Enemy type ${this.enemyType} not found in enemies data`);
            this.enemyData = null;
        }
    }

    private setupBody() {
        const body = this.body as Phaser.Physics.Arcade.Body;

        if (this.enemyData && this.enemyData.body) {
            const bodyConfig = this.enemyData.body;
            body.setCircle(bodyConfig.radius, bodyConfig.offsetX, bodyConfig.offsetY);
            this.setScale(this.enemyData.scale || 1);
        } else {
            // Configuration par défaut
            body.setCircle(this.displayWidth / 2);
        }
    }

    private setupComponents(bulletsGroup: Phaser.Physics.Arcade.Group) {
        if (!this.enemyData) {
            // Configuration par défaut
            this.addComponent(new WeaponComponent(
                bulletsGroup,
                this.scene.sound.add('sfx_laser2'),
                4, // bulletSpeed
                1  // bulletDamage
            ));
            this.addComponent(new MovementComponent(0.2));
            this.addComponent(new HealthComponent(1));
            return;
        }

        // Ajouter le composant d'arme
        if (this.enemyData.weapon) {
            const weaponConfig = this.enemyData.weapon;
            this.addComponent(new WeaponComponent(
                bulletsGroup,
                this.scene.sound.add('sfx_laser2'),
                weaponConfig.projectileSpeed || 4, // bulletSpeed
                weaponConfig.damage || 1 // bulletDamage
            ));
        } else {
            this.addComponent(new WeaponComponent(
                bulletsGroup,
                this.scene.sound.add('sfx_laser2'),
                4, // bulletSpeed
                1  // bulletDamage
            ));
        }

        // Ajouter le composant de mouvement
        this.addComponent(new MovementComponent(this.enemyData.speed || 0.2));

        // Ajouter le composant de santé
        this.addComponent(new HealthComponent(this.enemyData.health || 1));
    }

    private setupShootTimer() {
        // Configurer le timer de tir en fonction du type d'ennemi
        let delay = 3000; // Délai par défaut

        if (this.enemyData && this.enemyData.weapon) {
            delay = this.enemyData.weapon.fireRate || delay;
        }

        this.shootTimerConfig = {
            delay: Phaser.Math.Between(delay * 0.8, delay * 1.2), // Ajouter un peu de variabilité
            callback: this.shoot,
            callbackScope: this,
            loop: true,
        };

        this.shootTimer = this.scene.time.addEvent(this.shootTimerConfig);
    }

    private setupAnimations() {
        if (!this.enemyData || !this.enemyData.textures) return;

        const textures = this.enemyData.textures;

        if (this.enemyType !== 'saucer') {
            // Animation d'idle pour les types autres que saucer
            const idleAnimKey = `${this.enemyType}Idle`;
            if (!this.scene.anims.exists(idleAnimKey)) {
                this.scene.anims.create({
                    key: idleAnimKey,
                    frames: [
                        { key: 'sprites', frame: `${textures.default}.png` },
                        { key: 'sprites', frame: `${textures.speed_1}.png` }
                    ],
                    frameRate: 2,
                    repeat: -1
                });
            }
        } else {
            // Animation de tir uniquement pour le saucer
            const shootAnimKey = `${this.enemyType}Shoot`;
            if (!this.scene.anims.exists(shootAnimKey)) {
                this.scene.anims.create({
                    key: shootAnimKey,
                    frames: [
                        { key: 'sprites', frame: `${textures.default}.png` },
                        { key: 'sprites', frame: `${textures.speed_1}.png` },
                        { key: 'sprites', frame: `${textures.speed_2}.png` }
                    ],
                    frameRate: 8,
                    repeat: 0,
                    hideOnComplete: false
                });
            }
        }
    }

    public setEnemyType(type: string) {
        this.enemyType = type;
        return this;
    }

    public getEnemyType(): string {
        return this.enemyType;
    }

    public setFormationData(data: any): void {
        this.formationData = data;
    }

    public getFormationData(): any {
        return this.formationData;
    }

    public enable(x: number, y: number) {
        this.setPosition(x, y);
        this.setActive(true);
        this.setVisible(true);

        // Démarrer l'animation d'idle pour les types autres que saucer
        if (this.enemyType !== 'saucer') {
            this.play(`${this.enemyType}Idle`);
        } else {
            // Pour le saucer, juste afficher la frame par défaut
            this.setFrame(`${this.enemyData.textures.default}.png`);
        }

        // Activer le corps physique
        this.scene.physics.world.enable(this);
        (this.body as Phaser.Physics.Arcade.Body).setEnable(true);

        // Réinitialiser le timer de tir
        if (this.shootTimer) {
            this.shootTimer.reset(this.shootTimerConfig);
            this.shootTimer.paused = false;
        }

        this.getComponent(HealthComponent)?.once("death", () => {
            // Ajouter des points au score si l'ennemi a une valeur en points
            if (this.enemyData && this.enemyData.points) {
                this.scene.registry.inc('playerScore', this.enemyData.points);
            }

            this.disable();
        });
    }

    public disable() {
        this.disableBody(true, true);
        this.scene.physics.world.disable(this);
        if (this.shootTimer) {
            this.shootTimer.paused = true;
        }
    }

    private shoot() {
        if (this.active) {
            if (this.enemyType === 'saucer') {
                // Pour le saucer, jouer l'animation de tir
                const shootAnimKey = `${this.enemyType}Shoot`;
                if (this.scene.anims.exists(shootAnimKey)) {
                    this.play(shootAnimKey);
                    this.once(Phaser.Animations.Events.ANIMATION_COMPLETE, () => {
                        this.getComponent(WeaponComponent)?.shoot(this as Entity);
                        this.scene.sound.play('sfx_laser2');

                        // Revenir à la frame par défaut
                        this.setFrame(`${this.enemyData.textures.default}.png`);
                    });
                } else {
                    // Fallback si l'animation n'existe pas
                    this.getComponent(WeaponComponent)?.shoot(this as Entity);
                    this.scene.sound.play('sfx_laser2');
                }
            } else {
                // Pour les autres types, tirer directement sans animation de tir
                this.getComponent(WeaponComponent)?.shoot(this as Entity);
                this.scene.sound.play('sfx_laser2');
            }
        }
    }

    public preUpdate(time: number, deltaTime: number) {
        super.preUpdate(time, deltaTime);
        if (this.y >= this.scene.cameras.main.height + this.displayHeight) {
            this.disable();
        }

        // Mettre à jour le mouvement si l'ennemi n'est pas dans une formation
        if (!this.formationData) {
            this.getComponent(MovementComponent)?.moveVertically(this, deltaTime);
        }
    }
}