import {Bird, BirdType, Commands} from './bird';
import {Events} from '../../event-manager/events';
import {NeuralNetwork} from 'brain.js/src/index';
import {EventManager} from '../../event-manager/event-manager';
import {flapCoolDownMs} from '../../constants';
import {dimensionHeight, dimensionWidth} from '../../game';
import {scale} from '../../scale';

let lastOutput;

export class SupervisedTrainedBird extends Bird {
    private static inputData: {
        input: number[],
        output: number[]
    }[] = [];

    private static neuralNetwork: NeuralNetwork = new NeuralNetwork({
        binaryThresh: 0.5,
        hiddenLayers: [7],
        activation: 'tanh'
    });

    public constructor(options: { initialPosition: Phaser.Geom.Point, scene: Phaser.Scene, id: number }) {
        super(options, BirdType.PLAYER_TRAINED);

        EventManager.on(Events.PLAYER_CONTROLLED_BIRD_FLAPPED, async (data: {
            inputTimeCounterMs,
            verticalPosition,
            closestPipeGapVerticalPosition,
            horizontalDistanceToClosestPipe,
            output
        }) => {
            if (this.alive) {
                const items = {
                    input: [data.inputTimeCounterMs,
                        data.verticalPosition,
                        data.closestPipeGapVerticalPosition,
                        data.horizontalDistanceToClosestPipe],
                    output: [data.output]
                };
                SupervisedTrainedBird.inputData.push(items);
                await SupervisedTrainedBird.neuralNetwork.trainAsync(SupervisedTrainedBird.inputData);
            }
        });
    }

    protected handleBirdInput(data: {
        verticalPosition: number,
        closestPipeGapVerticalPosition: number,
        horizontalDistanceToClosestPipe: number,
        delta: number
    }): boolean {
        if (SupervisedTrainedBird.inputData.length <= 0) {
            return false;
        }
        const outputs = SupervisedTrainedBird.neuralNetwork
            .run([(this.inputTimeCounterMs % flapCoolDownMs) / flapCoolDownMs,
                data.verticalPosition / (dimensionHeight * scale),
                data.closestPipeGapVerticalPosition / (dimensionHeight * scale),
                data.horizontalDistanceToClosestPipe / (dimensionWidth * scale)]);
        lastOutput = outputs;
        if (outputs.length > 0 && outputs[0] > 0.5) {
            this.commands.push(Commands.FLAP_WING);
            return true;
        }
        return false;
    }

    protected dataToSendOnBirdDeath(): any {
        console.log(lastOutput);
        return super.dataToSendOnBirdDeath();
    }
}
