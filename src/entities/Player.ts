import { Entity } from "./Entity";
import { WeaponComponent } from "../components/WeaponComponent";
import { MovementComponent } from "../components/MovementComponent";
import { HealthComponent } from "../components/HealthComponent";

export class Player extends Entity {
    private readonly rateOfFire: number;
    private playerShipData: PlayerShipData;
    private lastShotTime: number;
    private cursorKeys: Phaser.Types.Input.Keyboard.CursorKeys;


    public constructor(scene: Phaser.Scene, x: number, y: number, texture: string, bullets: Phaser.Physics.Arcade.Group, frame?: string) {
        super(scene, x, y, texture, frame);

        this.addComponent(new MovementComponent());
        this.addComponent(new HealthComponent(1));

        this.rateOfFire = 0.5;
        this.lastShotTime = 0;
        this.angle = -90;

        if (this.scene.input.keyboard) {
            this.cursorKeys = this.scene.input.keyboard.createCursorKeys();
        }

        this.addComponent(new WeaponComponent(bullets, scene.sound.add('sfx_laser1'), 4, 12, 1024, 0xFFFFFF));
        this.selectPlayerShip(1);
    }

    public selectPlayerShip(playerShipId: number) {

        const playerShipsData = this.scene.cache.json.get('playerShips') as PlayerShipData[];
        this.playerShipData = playerShipsData[playerShipId];

        this.setTexture('sprites', this.playerShipData.texture);


        this.arcadeBody.setCircle(this.playerShipData.body.radius, this.playerShipData.body.offSetX, this.playerShipData.body.offSetY);
        this.arcadeBody.updateCenter();

        this.getComponent(MovementComponent)?.setSpeed(this.playerShipData.movementSpeed);
    }

    preUpdate(timeSinceLaunch: number, deltaTime: number) {
        super.preUpdate(timeSinceLaunch, deltaTime);
        console.log("preupdate called")
        if (this.playerShipData) {
            if (this.cursorKeys.left.isDown) {
                this.getComponent(MovementComponent)?.moveHorizontally(this, -deltaTime);
                this.angle = Phaser.Math.Linear(this.angle, -105, 0.1);

            } else if (this.cursorKeys.right.isDown) {
                this.getComponent(MovementComponent)?.moveHorizontally(this, deltaTime);
                this.angle = Phaser.Math.Linear(this.angle, -75, 0.1);

            } else {
                this.angle = Phaser.Math.Linear(this.angle, -90, 0.1);
            }
        }
        if (this.cursorKeys.space.isDown && timeSinceLaunch - this.lastShotTime > this.rateOfFire * 1000) {
            console.log("Shooting");
            this.getComponent(WeaponComponent)?.shoot(this);
            this.lastShotTime = timeSinceLaunch;
        }
        this.x = Phaser.Math.Clamp(this.x, this.displayWidth / 2, this.scene.cameras.main.width - this.displayWidth / 2);
        this.y = Phaser.Math.Clamp(this.y, this.displayHeight / 2, this.scene.cameras.main.height - this.displayHeight / 2);
    }
}
