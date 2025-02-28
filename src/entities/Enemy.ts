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

    public init(bulletsGroup: Phaser.Physics.Arcade.Group, enemyType: string = 'swarm') {
        this.enemyType = enemyType;
        console.log(`Initializing enemy of type: ${this.enemyType}`);

        const enemiesData = this.scene.cache.json.get('enemies');
        this.enemyData = enemiesData[this.enemyType];

        if (!this.enemyData) {
            console.error(`Enemy type ${this.enemyType} not found in enemies.json`);
            this.enemyType = 'swarm';
            this.enemyData = enemiesData[this.enemyType];
        }

        if (this.enemyData.textures && this.enemyData.textures.default) {
            this.setFrame(`${this.enemyData.textures.default}.png`);
        }

        if (this.enemyData.scale) {
            this.setScale(this.enemyData.scale);
        }

        this.setupBody();

        this.setupComponents(bulletsGroup);

        this.setupAnimations();

        this.setupShootTimer();

        this.setActive(false);
        this.setVisible(false);
    }

    private setupBody() {
        const body = this.body as Phaser.Physics.Arcade.Body;

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

    private setupComponents(bulletsGroup: Phaser.Physics.Arcade.Group) {
        if (!this.enemyData) {
            // Configuration par défaut
            this.addComponent(new WeaponComponent(
                bulletsGroup,
                this.scene.sound.add('sfx_laser2'),
                4,
                1
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
                weaponConfig.projectileSpeed || 4,
                weaponConfig.damage || 1
            ));
        } else {
            this.addComponent(new WeaponComponent(
                bulletsGroup,
                this.scene.sound.add('sfx_laser2'),
                4,
                1
            ));
        }

        this.addComponent(new MovementComponent(this.enemyData.speed || 0.2));

        this.addComponent(new HealthComponent(this.enemyData.health || 1));
    }

    private setupShootTimer() {
        let delay = 3000;

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

    public enable(x: number, y: number) {
        this.setPosition(x, y);
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
        }

        this.getComponent(HealthComponent)?.once("death", () => {
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