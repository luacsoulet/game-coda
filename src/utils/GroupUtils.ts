import { Physics } from "phaser";

export class GroupUtils {
    public preallocateGroup(group: Physics.Arcade.Group, size: number) {

        if (group.getLength() >= size) {
            return;
        }

        const canBeDisabled = group.classType && typeof group.classType.prototype.disable === 'function';

        for (let i = 0; i < size; i++) {
            let groupItem = group.create();
            if (canBeDisabled) {
                groupItem.disable();
            }
        }
    }
}