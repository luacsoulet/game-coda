import { Entity } from "./Entity";
import { WeaponComponent } from "../components/WeaponComponent";
import { MovementComponent } from "../components/MovementComponent";
import { HealthComponent } from "../components/HealthComponent";
export class Enemy extends Entity {
    private shootTimer: Phaser.Time.TimerEvent;
    private shootTimerConfig: Phaser.Types.Time.TimerEventConfig;

    public init(bulletsGroup: Phaser.Physics.Arcade.Group) {
        this.angle = 90;

        // Configurer le corps circulaire
        const body = this.body as Phaser.Physics.Arcade.Body;
        body.setCircle(this.displayWidth / 2);

        this.addComponent(new WeaponComponent(bulletsGroup, this.scene.sound.add('sfx_laser2'), 4, 12, 512, 0xC1292E));
        this.addComponent(new MovementComponent(0.2));
        this.addComponent(new HealthComponent(1));

        this.shootTimerConfig = {
            delay: Phaser.Math.Between(2000, 3000),
            callback: this.shoot,
            callbackScope: this,
            loop: true,
        };

        this.shootTimer = this.scene.time.addEvent(this.shootTimerConfig);

        if (!this.scene.anims.exists('ufoShoot')) {
            this.scene.anims.create({
                key: 'ufoShoot',
                frames: [
                    { key: 'sprites', frame: 'ufoRed.png' },
                    { key: 'sprites', frame: 'ufoRed-shoot2.png' },
                    { key: 'sprites', frame: 'ufoRed-shoot3.png' },
                ],
                frameRate: 4,
            });
        }

        this.shootTimer = this.scene.time.addEvent(this.shootTimerConfig);
    }

    public enable(x: number, y: number) {
        this.enableBody(true, x, y - this.displayWidth, true, true);
        this.shootTimer.reset(this.shootTimerConfig);
        this.shootTimer.paused = false;

        this.getComponent(HealthComponent)?.once("death", () => {
            this.disable();
        });
    }

    public disable() {
        this.disableBody(true, true);
        this.shootTimer.paused = true;
    }

    private shoot() {
        if (this.active) {
            this.play('ufoShoot');
            this.once(Phaser.Animations.Events.ANIMATION_COMPLETE, () => {
                this.getComponent(WeaponComponent)?.shoot(this as Entity);
                this.scene.sound.play('sfx_laser2');
            });
        }
    }

    public preUpdate(time: number, deltaTime: number) {
        super.preUpdate(time, deltaTime);
        if (this.y >= this.scene.cameras.main.height + this.displayHeight) {
            this.disable();
        }

        this.getComponent(MovementComponent)?.moveVertically(this, deltaTime);
    }
}