import {Chromosome} from '../chromosome';
import {Bird, BirdType, Commands} from './bird';
import {NeuralNetwork} from '../../ai/neural-network';
import {dimensionHeight, dimensionWidth} from '../../game';
import {scale} from '../../scale';

export class GeneticallyTrainedBird extends Bird {
    private readonly chromosome: Chromosome;
    private readonly neuralNetwork: NeuralNetwork;

    public constructor(options: { initialPosition: Phaser.Geom.Point, scene: Phaser.Scene, id: number }, chromosome) {
        super(options, BirdType.GENETICALLY_TRAINED);
        this.chromosome = chromosome;
        this.neuralNetwork = new NeuralNetwork({
            inputs: 3,
            hiddenNeurons: 5,
            outputs: 1
        }, this.chromosome ? this.chromosome.genes : null);
        if (!this.chromosome || !this.chromosome.genes) {
            this.chromosome = {
                genes: this.neuralNetwork.getWeights()
            };
        }
    }

    protected handleBirdInput(data: {
        verticalPosition: number,
        closestPipeGapVerticalPosition: number,
        horizontalDistanceToClosestPipe: number,
        delta: number
    }): boolean {
        const output = this.neuralNetwork.doTheMagic([data.verticalPosition / (dimensionHeight * scale),
            data.closestPipeGapVerticalPosition / (dimensionHeight * scale),
            data.horizontalDistanceToClosestPipe / (dimensionWidth * scale)]);
        if (output[0] > -0.2) {
            this.commands.push(Commands.FLAP_WING);
            return true;
        }
        return false;
    }

    protected dataToSendOnBirdDeath(): any {
        return this.chromosome;
    }
}
