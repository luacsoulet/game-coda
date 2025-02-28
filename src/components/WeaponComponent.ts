import { Entity } from "../entities/Entity";
import { Bullet } from "../entities/Bullet";

export class WeaponComponent implements IComponent {
    private readonly bullets: Phaser.Physics.Arcade.Group;
    private readonly shootSound: Phaser.Sound.BaseSound;
    private readonly bulletSpeed: number;
    private readonly bulletWidth: number;
    private readonly bulletHeight: number;
    private readonly bulletColor: number;
    private readonly bulletDamage: number;

    public constructor(
        bullets: Phaser.Physics.Arcade.Group,
        shootSound: Phaser.Sound.BaseSound,
        bulletSpeed: number,
        bulletDamage: number = 1,
        bulletWidth: number = 4,
        bulletHeight: number = 12,
        bulletColor: number = 0xFFFFFF
    ) {
        this.bullets = bullets;
        this.shootSound = shootSound;
        this.bulletSpeed = bulletSpeed;
        this.bulletDamage = bulletDamage;
        this.bulletWidth = bulletWidth;
        this.bulletHeight = bulletHeight;
        this.bulletColor = bulletColor;
    }

    public shoot(entity: Entity) {
        const bullet: Bullet = this.bullets.get() as Bullet;
        if (bullet) {
            const isPlayer = entity.constructor.name === 'Player';

            let velocityX = 0;
            let velocityY = 0;

            if (isPlayer) {
                const angle: number = entity.rotation;
                const forwardVectorX: number = Math.cos(angle);
                const forwardVectorY: number = Math.sin(angle);
                velocityX = forwardVectorX * this.bulletSpeed;
                velocityY = forwardVectorY * this.bulletSpeed;
            } else {
                velocityX = 0;
                velocityY = this.bulletSpeed;
            }

            bullet.enable(
                entity.x,
                entity.y,
                this.bulletWidth,
                this.bulletHeight,
                this.bulletColor,
                velocityX,
                velocityY
            );
            (bullet as any).damage = this.bulletDamage;

            this.shootSound.play();
        }
    }
}