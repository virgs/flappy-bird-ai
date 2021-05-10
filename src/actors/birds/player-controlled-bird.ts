import {Bird, BirdType, Commands} from './bird';
import KeyCodes = Phaser.Input.Keyboard.KeyCodes;

export class PlayerControlledBird extends Bird {
    private readonly keys: Phaser.Input.Keyboard.Key[] = [];

    public constructor(options: { initialPosition: Phaser.Geom.Point, scene: Phaser.Scene, id: number }) {
        super(options, BirdType.PLAYER_CONTROLLED);
        this.keys = [options.scene.input.keyboard.addKey(KeyCodes.SPACE)];
    }

    protected handleBirdInput(data: {
        verticalPosition: number,
        closestPipeGapVerticalPosition: number,
        horizontalDistanceToClosestPipe: number,
        delta: number
    }): boolean {
        if (this.keys
            .some(key => key.isDown)) {
            this.commands.push(Commands.FLAP_WING);
            return true;
        }
        return false;
    }

}
