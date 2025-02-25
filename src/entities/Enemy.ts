import { Entity } from "./Entity";
import { WeaponComponent } from "../components/WeaponComponent";

export class Enemy extends Entity {
    private shootTimer: Phaser.Time.TimerEvent;
    private shootTimerConfig: Phaser.Types.Time.TimerEventConfig;

    public init(bulletsGroup: Phaser.Physics.Arcade.Group) {
        this.angle = -90;

        this.addComponent(new WeaponComponent(bulletsGroup, this.scene.sound.add('sfx_laser2'), 4, 12, 512, 0xC1292E));

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
        this.angle = 90;
        this.enableBody(true, x, y - this.displayWidth, true, true);
        this.setPosition(x, y);
        this.setActive(true);
        this.setVisible(true);
        this.shootTimer.paused = false;
        this.setVelocityY(256);
    }

    public disable() {
        this.enableBody(false);
        this.setActive(false);
        this.setVisible(false);
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

    public preUpdate(time: number, delta: number) {
        super.preUpdate(time, delta);
        if (this.y >= this.scene.cameras.main.height + this.displayHeight) {
            this.destroy();
        }
    }
}