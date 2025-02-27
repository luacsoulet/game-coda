export class HealthComponent extends Phaser.Events.EventEmitter implements IComponent {

    private value: number;
    private max: number;

    public constructor(value: number) {
        super();
        this.value = value;
        this.max = value;
    }

    public setHealth(health: number): void {
        this.value = health;
        this.max = health;
    }

    public getValue(): number {
        return this.value;
    }

    public getMax(): number {
        return this.max;
    }

    public inc(amount: number): void {
        this.value += amount;

        this.emit("change", this.value);

        if (this.value <= 0) {
            this.emit("death");
        }
    }


}