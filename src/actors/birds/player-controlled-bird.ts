import {Bird, BirdType, Commands} from './bird';
import {EventManager} from '../../event-manager/event-manager';
import {Events} from '../../event-manager/events';
import KeyCodes = Phaser.Input.Keyboard.KeyCodes;

export class PlayerControlledBird extends Bird {
    private readonly notFlappedEventTimeThresholdMs: number = 500;
    private readonly keys: Phaser.Input.Keyboard.Key[] = [];
    private notFlappedEventCounter: number = 0;

    public constructor(options: { initialPosition: Phaser.Geom.Point, scene: Phaser.Scene, id: number }) {
        super(options, BirdType.PLAYER_CONTROLLED);
        this.keys = [options.scene.input.keyboard.addKey(KeyCodes.SPACE)];
    }

    protected handleBirdInput(data: {
        verticalDistanceToTheCenterOfClosestPipeGap: number,
        horizontalDistanceToClosestPipe: number,
        delta: number
    }): boolean {
        if (this.keys
            .some(key => key.isDown)) {
            this.commands.push(Commands.FLAP_WING);

            EventManager.emit(Events.PLAYER_CONTROLLED_BIRD_FLAPPED, {
                verticalDistanceToTheCenterOfClosestPipeGap: data.verticalDistanceToTheCenterOfClosestPipeGap,
                horizontalDistanceToClosestPipe: data.horizontalDistanceToClosestPipe,
                output: true
            });
            return true;
        }
        this.notFlappedEventCounter += data.delta;
        if (this.notFlappedEventCounter > this.notFlappedEventTimeThresholdMs) {
            this.notFlappedEventCounter %= this.notFlappedEventTimeThresholdMs;
            EventManager.emit(Events.PLAYER_CONTROLLED_BIRD_FLAPPED, {
                verticalDistanceToTheCenterOfClosestPipeGap: data.verticalDistanceToTheCenterOfClosestPipeGap,
                horizontalDistanceToClosestPipe: data.horizontalDistanceToClosestPipe,
                output: false
            });
        }

        return false;
    }

}
