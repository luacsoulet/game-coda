import { Physics } from 'phaser';

export class Bullet extends Phaser.GameObjects.Rectangle {

    public arcadeBody: Phaser.Physics.Arcade.Body;

    public init() {
        this.arcadeBody = this.body as Phaser.Physics.Arcade.Body;
        this.arcadeBody.allowGravity = false;
        this.arcadeBody.setFriction(0, 0);
    }

    public enable(x: number, y: number, width: number, height: number, color: number, velocityX: number, velocityY: number) {
        console.log(x, y)
        this.setPosition(x, y);
        this.setSize(width, height);
        this.setOrigin(0.5);
        this.setFillStyle(color);

        this.scene.physics.world.add(this.arcadeBody);
        this.setActive(true);
        this.setVisible(true);

        this.arcadeBody.setSize(width, height);
        this.arcadeBody.setVelocity(velocityX, velocityY);
    }

    public disable() {
        this.scene.physics.world.remove(this.arcadeBody);
        this.arcadeBody.setEnable(false);
        this.setActive(false);
        this.setVisible(false);
    }

    update(timeSinceLaunch: number, deltaTime: number) {
        super.update(timeSinceLaunch, deltaTime);
        if (this.y > this.scene.cameras.main.height + this.displayHeight || this.y < -this.displayHeight || this.x > this.scene.cameras.main.width + this.displayWidth || this.x < -this.displayWidth) {
            this.disable();
        }
    }
}
