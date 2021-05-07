import {Bird, BirdType, Commands} from './bird';
import {Events} from '../../event-manager/events';
import {NeuralNetwork} from 'brain.js/src/index';
import {EventManager} from '../../event-manager/event-manager';

export class PlayerTrainedBird extends Bird {
    private static inputData: {
        input: number[],
        output: number[]
    }[] = [];

    private static neuralNetwork: NeuralNetwork = new NeuralNetwork({
        binaryThresh: 0.4,
        hiddenLayers: [4],
        activation: 'sigmoid'
    });

    public constructor(options: { initialPosition: Phaser.Geom.Point, scene: Phaser.Scene, id: number }) {
        super(options, BirdType.PLAYER_TRAINED);

        EventManager.on(Events.PLAYER_CONTROLLED_BIRD_FLAPPED, async (data: {
            verticalPosition,
            verticalDistanceToTheCenterOfClosestPipeGap,
            horizontalDistanceToClosestPipe,
            output
        }) => {
            PlayerTrainedBird.inputData.push({
                input: [data.verticalPosition, data.verticalDistanceToTheCenterOfClosestPipeGap, data.horizontalDistanceToClosestPipe],
                output: [data.output]
            });
            await PlayerTrainedBird.neuralNetwork.trainAsync(PlayerTrainedBird.inputData);
        });

        if (PlayerTrainedBird.inputData.length > 0) {
            PlayerTrainedBird.neuralNetwork.trainAsync(PlayerTrainedBird.inputData).then();
        }
    }

    protected handleBirdInput(data: {
        verticalPosition: number,
        verticalDistanceToTheCenterOfClosestPipeGap: number,
        horizontalDistanceToClosestPipe: number,
        delta: number
    }): boolean {
        if (PlayerTrainedBird.inputData.length <= 0) {
            return false;
        }
        const outputs = PlayerTrainedBird.neuralNetwork
            .run([data.verticalPosition, data.verticalDistanceToTheCenterOfClosestPipeGap, data.horizontalDistanceToClosestPipe]);
        if (outputs.length > 0 && outputs[0] > 0.5) {
            this.commands.push(Commands.FLAP_WING);
            return true;
        }
        return false;
    }

}
