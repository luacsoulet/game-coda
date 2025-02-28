import { Entity } from "./Entity";
import { WeaponComponent } from "../components/WeaponComponent";
import { MovementComponent } from "../components/MovementComponent";
import { HealthComponent } from "../components/HealthComponent";
import { GameDataKeys } from "../GameDataKeys";

export class Player extends Entity {
    private rateOfFire: number;
    private playerShipData: PlayerShipData;
    private lastShotTime: number;
    private cursorKeys: Phaser.Types.Input.Keyboard.CursorKeys;

    preload() {
        this.scene.load.atlas('sprites', 'Spritesheet/gameSprites.png', 'Spritesheet/gameSprites.json');
    }

    public constructor(scene: Phaser.Scene, x: number, y: number, texture: string, bullets: Phaser.Physics.Arcade.Group, frame?: string) {
        super(scene, x, y, texture, frame);

        this.addComponent(new MovementComponent());
        this.addComponent(new HealthComponent(1));

        this.lastShotTime = 0;
        this.angle = -90;

        if (this.scene.input.keyboard) {
            this.cursorKeys = this.scene.input.keyboard.createCursorKeys();
        }

        this.addComponent(new WeaponComponent(
            bullets,
            scene.sound.add('sfx_laser1'),
            528,
            1,
            4,
            12,
            0x00FFFF
        ));
        this.selectPlayerShip(this.scene.registry.get(GameDataKeys.SelectedShip));

        this.anims.create({
            key: 'playerShipIdle_1',
            frames: [
                { key: 'sprites', frame: 'playerShip1_blue.png' },
                { key: 'sprites', frame: 'playerShip1_blue_boost.png' },
            ],
            frameRate: 30,
            repeat: -1,
        });

        this.anims.create({
            key: 'playerShipIdle_2',
            frames: [
                { key: 'sprites', frame: 'playerShip2_blue.png' },
                { key: 'sprites', frame: 'playerShip2_blue_boost.png' },
            ],
            frameRate: 30,
            repeat: -1,
        });

        this.anims.create({
            key: 'playerShipIdle_3',
            frames: [
                { key: 'sprites', frame: 'playerShip3_blue.png' },
                { key: 'sprites', frame: 'playerShip3_blue_boost.png' },
            ],
            frameRate: 30,
            repeat: -1,
        });
    }

    public selectPlayerShip(playerShipId: number) {

        const playerShipsData = this.scene.cache.json.get('playerShips') as PlayerShipData[];
        this.playerShipData = playerShipsData[playerShipId];

        this.setTexture('sprites', this.playerShipData.texture[0]);


        this.arcadeBody.setCircle(this.playerShipData.body.radius, this.playerShipData.body.offSetX, this.playerShipData.body.offSetY);
        this.arcadeBody.updateCenter();

        this.getComponent(MovementComponent)?.setSpeed(this.playerShipData.movementSpeed);
        this.getComponent(HealthComponent)?.setHealth(this.playerShipData.health);
        this.rateOfFire = this.playerShipData.shootingRate;

        this.play('playerShipIdle_' + playerShipId);
    }


    preUpdate(timeSinceLaunch: number, deltaTime: number) {
        super.preUpdate(timeSinceLaunch, deltaTime);
        console.log("preupdate called")
        if (this.playerShipData && this.cursorKeys) {
            if (this.cursorKeys.left.isDown) {
                this.getComponent(MovementComponent)?.moveHorizontally(this, -deltaTime);
                this.angle = Phaser.Math.Linear(this.angle, -105, 0.1);

            } else if (this.cursorKeys.right.isDown) {
                this.getComponent(MovementComponent)?.moveHorizontally(this, deltaTime);
                this.angle = Phaser.Math.Linear(this.angle, -75, 0.1);

            } else {
                this.angle = Phaser.Math.Linear(this.angle, -90, 0.1);
            }

            if (this.cursorKeys.space.isDown && timeSinceLaunch - this.lastShotTime > this.rateOfFire * 1000) {
                console.log("Shooting");
                console.log(this.rateOfFire);
                this.getComponent(WeaponComponent)?.shoot(this);
                this.lastShotTime = timeSinceLaunch;
            }
        }

        this.x = Phaser.Math.Clamp(this.x, this.displayWidth / 2, this.scene.cameras.main.width - this.displayWidth / 2);
        this.y = Phaser.Math.Clamp(this.y, this.displayHeight / 2, this.scene.cameras.main.height - this.displayHeight / 2);
    }
}
