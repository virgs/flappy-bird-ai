import {Bird, Commands} from './bird';
import KeyCodes = Phaser.Input.Keyboard.KeyCodes;

export class PlayerBird extends Bird {
    private keys: Phaser.Input.Keyboard.Key[] = [];

    public constructor(options: { initialPosition: Phaser.Geom.Point, scene: Phaser.Scene, id: number }) {
        super(options, 'bird-blue');
        this.keys = [options.scene.input.keyboard.addKey(KeyCodes.SPACE)];
    }

    protected handleBirdInput(): boolean {
        if (this.keys
            .some(key => key.isDown)) {
            this.commands.push(Commands.FLAP_WING);
            return true;
        }
        return false;
    }

}
