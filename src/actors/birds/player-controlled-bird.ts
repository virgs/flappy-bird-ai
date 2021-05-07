import {Bird, BirdType, Commands} from './bird';
import {EventManager} from '../../event-manager/event-manager';
import {Events} from '../../event-manager/events';
import KeyCodes = Phaser.Input.Keyboard.KeyCodes;

export class PlayerControlledBird extends Bird {
    private readonly notFlappedEventTimeThresholdMs: number = 250;
    private readonly keys: Phaser.Input.Keyboard.Key[] = [];
    private notFlappedEventCounter: number = 0;
    private hasControlledAnythingInRound: boolean = false;

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

            this.hasControlledAnythingInRound = true;
            this.commands.push(Commands.FLAP_WING);
            EventManager.emit(Events.PLAYER_CONTROLLED_BIRD_FLAPPED, {
                verticalPosition: data.verticalPosition,
                closestPipeGapVerticalPosition: data.closestPipeGapVerticalPosition,
                horizontalDistanceToClosestPipe: data.horizontalDistanceToClosestPipe,
                output: 1
            });
            return true;
        }
        this.notFlappedEventCounter += data.delta;
        if (this.notFlappedEventCounter > this.notFlappedEventTimeThresholdMs) {

            if (this.hasControlledAnythingInRound) {
                this.notFlappedEventCounter %= this.notFlappedEventTimeThresholdMs;
                EventManager.emit(Events.PLAYER_CONTROLLED_BIRD_FLAPPED, {
                    verticalPosition: data.verticalPosition,
                    closestPipeGapVerticalPosition: data.closestPipeGapVerticalPosition,
                    horizontalDistanceToClosestPipe: data.horizontalDistanceToClosestPipe,
                    output: 0
                });
            }
        }

        return false;
    }

}
