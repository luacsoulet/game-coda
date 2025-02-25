import { Entity } from "../entities/Entity";
import { Bullet } from "../entities/Bullet";

export class WeaponComponent implements IComponent {
    private readonly bullets: Phaser.Physics.Arcade.Group;
    private readonly shootSound: Phaser.Sound.BaseSound;
    private readonly bulletWidth: number;
    private readonly bulletHeight: number;
    private readonly bulletSpeed: number;
    private readonly bulletColor: number;

    public constructor(bullets: Phaser.Physics.Arcade.Group, shootSound: Phaser.Sound.BaseSound, bulletWidth: number, bulletHeight: number, bulletSpeed: number, bulletColor: number) {
        this.bullets = bullets;
        this.shootSound = shootSound;
        this.bulletWidth = bulletWidth;
        this.bulletHeight = bulletHeight;
        this.bulletSpeed = bulletSpeed;
        this.bulletColor = bulletColor;
    }

    public shoot(entity: Entity) {
        const bullet: Bullet = this.bullets.get() as Bullet;
        if (bullet) {

            const angle: number = entity.rotation;
            const forwardVectorX: number = Math.cos(angle);
            const forwardVectorY: number = Math.sin(angle);
            const velocityX: number = forwardVectorX * this.bulletSpeed;
            const velocityY: number = forwardVectorY * this.bulletSpeed;

            bullet.enable(entity.x, entity.y, this.bulletWidth, this.bulletHeight, this.bulletColor, velocityX, velocityY);
            this.shootSound.play();
        }

    }
}