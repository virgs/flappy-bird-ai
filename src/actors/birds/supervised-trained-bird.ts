import {Bird, BirdType, Commands} from './bird';
import {Events} from '../../event-manager/events';
import {NeuralNetwork} from 'brain.js/src/index';
import {EventManager} from '../../event-manager/event-manager';
import {dimensionHeight, dimensionWidth} from '../../game';
import {scale} from '../../scale';

let lastOutput;

export class SupervisedTrainedBird extends Bird {
    private readonly delayAnalysis: number = 1000;

    private static trained: boolean = false;
    private static inputData: {
        input: number[],
        output: number[]
    }[] = [];

    private static neuralNetwork: NeuralNetwork = new NeuralNetwork({
        binaryThresh: 0.5,
        hiddenLayers: [6],
        activation: 'tanh'
    });

    private readonly deadBirdIds: number[] = [];

    public constructor(options: { initialPosition: Phaser.Geom.Point, scene: Phaser.Scene, id: number }) {
        super(options, BirdType.SUPERVISED_TRAINED);

        if (SupervisedTrainedBird.inputData.length > 0) {
            // SupervisedTrainedBird.neuralNetwork.train(SupervisedTrainedBird.inputData);
            // SupervisedTrainedBird.trained = true;
        }

        EventManager.on(Events.BIRD_DIED, (options: {
            type: BirdType,
            id: number
        }) => {
            if (options.type === BirdType.GENETICALLY_TRAINED) {
                this.deadBirdIds.push(options.id);
            }
        });

        EventManager.on(Events.BIRD_FLAPPED, (options: {
            id: number,
            inputs: number[],
            output: number
        }) => {
            setTimeout(() => {
                let result = options.output;
                //wrong decision!
                if (this.deadBirdIds.includes(options.id)) {
                    result = 1 - result;
                }
                const items = {
                    input: options.inputs,
                    output: [result]
                };
                if (SupervisedTrainedBird.inputData.length < 250) {
                    SupervisedTrainedBird.inputData.push(items);
                }
            }, this.delayAnalysis);
        });
    }

    protected handleBirdInput(data: {
        verticalPosition: number,
        closestPipeGapVerticalPosition: number,
        horizontalDistanceToClosestPipe: number,
        delta: number
    }): boolean {
        if (!SupervisedTrainedBird.trained) {
            return false;
        }
        const inputValues = [data.verticalPosition / (dimensionHeight * scale),
            data.closestPipeGapVerticalPosition / (dimensionHeight * scale),
            data.horizontalDistanceToClosestPipe / (dimensionWidth * scale)];

        const outputs = SupervisedTrainedBird.neuralNetwork
            .run(inputValues);
        lastOutput = outputs;
        if (outputs.length > 0 && outputs[0] > 0) {
            this.commands.push(Commands.FLAP_WING);
            return true;
        }
        return false;
    }

    protected dataToSendOnBirdDeath(): any {
        // console.log(lastOutput);
        return super.dataToSendOnBirdDeath();
    }
}
