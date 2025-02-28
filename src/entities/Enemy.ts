import { Entity } from "./Entity";
import { WeaponComponent } from "../components/WeaponComponent";
import { MovementComponent } from "../components/MovementComponent";
import { HealthComponent } from "../components/HealthComponent";
import { EnemyData } from "../gameData/EnemyData";

export class Enemy extends Entity {
    private shootTimer: Phaser.Time.TimerEvent;
    private shootTimerConfig: Phaser.Types.Time.TimerEventConfig;
    private enemyType: string;
    private enemyData: EnemyData;
    private formationData: any = null;
    private idleAnimation: Phaser.Animations.Animation;
    private enemyBullets: Phaser.Physics.Arcade.Group;
    private initialized: boolean = false;
    private initialSpawn: boolean = false;

    constructor(scene: Phaser.Scene, x: number, y: number, texture: string, frame?: string | number) {
        super(scene, x, y, texture, frame as string);
        this.enemyType = 'saucer'; // Type par défaut
    }

    public isInitialized(): boolean {
        return this.initialized;
    }

    public init(bulletsGroup: Phaser.Physics.Arcade.Group) {
        this.enemyBullets = bulletsGroup;
        this.initialized = true;

        this.setActive(false);
        this.setVisible(false);
    }

    public enable(x: number, y: number, enemyType: string = 'swarm') {
        this.enemyType = enemyType;
        this.initialSpawn = true;

        const enemiesData = this.scene.cache.json.get('enemies');
        this.enemyData = enemiesData[this.enemyType];

        if (!this.enemyData) {
            console.error(`Enemy type ${this.enemyType} not found in enemies.json`);
            this.enemyType = 'swarm';
            this.enemyData = enemiesData[this.enemyType];
        }

        // Réinitialiser complètement le sprite
        this.setTexture('sprites');

        if (this.enemyData.textures && this.enemyData.textures.default) {
            this.setFrame(`${this.enemyData.textures.default}.png`);
        }

        if (this.enemyData.scale) {
            this.setScale(this.enemyData.scale);
        } else {
            this.setScale(1);
        }

        this.anims.stop();

        this.setupBody();
        this.setupComponents();
        this.setupAnimations();
        this.setupShootTimer();

        // Animation d'apparition pour les swarm
        if (this.enemyType === 'swarm') {
            this.setPosition(x, y);
            this.alpha = 0;
            this.scene.tweens.add({
                targets: this,
                alpha: 1,
                duration: 500,
                ease: 'Power2'
            });
            this.initialSpawn = false;
        } else {
            this.setPosition(x, y - 200);
            this.alpha = 1;
        }

        this.setActive(true);
        this.setVisible(true);

        if (this.enemyType !== 'saucer') {
            this.play(`${this.enemyType}Idle`);
        } else {
            this.setFrame(`${this.enemyData.textures.default}.png`);
        }

        this.scene.physics.world.enable(this);
        (this.body as Phaser.Physics.Arcade.Body).setEnable(true);

        if (this.shootTimer) {
            this.shootTimer.reset(this.shootTimerConfig);
            this.shootTimer.paused = false;

            if (this.enemyType === 'saucer') {
                this.shootTimer.destroy();
                this.shootTimerConfig.delay = Phaser.Math.Between(1500, 2000);
                this.shootTimer = this.scene.time.addEvent(this.shootTimerConfig);
            }
        }

        this.getComponent(HealthComponent)?.once("death", () => {
            if (this.enemyData && this.enemyData.points) {
                this.scene.registry.inc('playerScore', this.enemyData.points);
            }

            this.disable();
        });
    }

    private setupBody() {
        this.body as Phaser.Physics.Arcade.Body;

        if (this.enemyData.body) {
            const body = this.body as Phaser.Physics.Arcade.Body;
            if (this.enemyData.body.radius) {
                body.setCircle(
                    this.enemyData.body.radius,
                    this.enemyData.body.offsetX || 0,
                    this.enemyData.body.offsetY || 0
                );
                this.setAngle(90);
            }
        }
    }

    private setupComponents() {
        if (!this.enemyData) {
            this.removeComponents(WeaponComponent);
            this.addComponent(new WeaponComponent(
                this.enemyBullets,
                this.scene.sound.add('sfx_laser2'),
                4,
                1
            ));

            this.removeComponents(MovementComponent);
            this.addComponent(new MovementComponent(0.2));

            this.removeComponents(HealthComponent);
            this.addComponent(new HealthComponent(1));
            return;
        } else {

            // Weapon
            this.removeComponents(WeaponComponent);
            if (this.enemyData.weapon) {
                this.addComponent(new WeaponComponent(
                    this.enemyBullets,
                    this.scene.sound.add('sfx_laser2'),
                    this.enemyData.weapon.projectileSpeed || 4,
                    this.enemyData.weapon.damage || 1
                ));
            } else {
                this.addComponent(new WeaponComponent(
                    this.enemyBullets,
                    this.scene.sound.add('sfx_laser2'),
                    4,
                    1
                ));
            }

            // Movement
            this.removeComponents(MovementComponent);
            if (this.enemyData.speed) {
                this.addComponent(new MovementComponent(this.enemyData.speed));
            } else {
                this.addComponent(new MovementComponent(0.2));
            }

            // Health
            this.removeComponents(HealthComponent);
            if (this.enemyData.health) {
                this.addComponent(new HealthComponent(this.enemyData.health));
            } else {
                this.addComponent(new HealthComponent(1));
            }
        }
    }

    private setupShootTimer() {
        let delay = this.enemyData.weapon?.fireRate || 3000;

        if (this.enemyData && this.enemyData.weapon) {
            delay = this.enemyData.weapon.fireRate || delay;
        }

        this.shootTimerConfig = {
            delay: Phaser.Math.Between(delay * 0.8, delay * 1.2),
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

    public disable() {
        this.anims.stop();

        this.enemyType = 'saucer';

        this.disableBody(true, true);
        this.scene.physics.world.disable(this);

        if (this.shootTimer) {
            this.shootTimer.paused = true;
        }

        this.setActive(false);
        this.setVisible(false);

        this.initialSpawn = false;
    }

    private shoot() {
        if (this.active) {
            if (this.enemyType === 'saucer') {
                const shootAnimKey = `${this.enemyType}Shoot`;
                if (this.scene.anims.exists(shootAnimKey)) {
                    this.play(shootAnimKey);
                    this.once(Phaser.Animations.Events.ANIMATION_COMPLETE, () => {
                        this.getComponent(WeaponComponent)?.shoot(this as Entity);
                        this.scene.sound.play('sfx_laser2');

                        this.setFrame(`${this.enemyData.textures.default}.png`);
                    });
                } else {
                    this.getComponent(WeaponComponent)?.shoot(this as Entity);
                    this.scene.sound.play('sfx_laser2');
                }
            } else {
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

        if (!this.formationData) {
            this.getComponent(MovementComponent)?.moveVertically(this, deltaTime);
        }
    }
}