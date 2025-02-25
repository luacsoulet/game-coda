export class Entity extends Phaser.Physics.Arcade.Sprite {
    public arcadeBody: Phaser.Physics.Arcade.Body;

    private components: IComponent[] = [];

    constructor(scene: Phaser.Scene, x: number, y: number, texture: string, frame?: string) {

        super(scene, x, y, texture, frame);

        scene.add.existing(this);
        scene.physics.add.existing(this);
        this.arcadeBody = this.body as Phaser.Physics.Arcade.Body;
    }

    // public init() {
    //     this.arcadeBody = this.body as Phaser.Physics.Arcade.Body;
    //     this.arcadeBody.allowGravity = false;
    //     this.arcadeBody.setFriction(0, 0);
    // }

    public addComponent(component: IComponent) {
        this.components.push(component);
    }

    public removeComponent(component: IComponent) {
        const index = this.components.indexOf(component);
        if (index >= 0) {
            this.components.splice(index, 1);
        }
    }

    public removeComponents<T extends IComponent>(type: new (...args: any[]) => T) {
        this.components = this.components.filter(c => !(c instanceof type));
    }

    public getComponent<T extends IComponent>(type: new (...args: any[]) => T): T | undefined {
        return this.components.find(c => c instanceof type) as T;
    }

    public getComponents<T extends IComponent>(type: new (...args: any[]) => T): T[] {
        return this.components.filter(c => c instanceof type) as T[];
    }
}