import {scale} from '../../scale';
import {Chromosome} from '../chromosome';
import {Bird, BirdType, Commands} from './bird';
import {NeuralNetwork} from '../../ai/neural-network';
import {dimensionHeight, dimensionWidth} from '../../game';

export class GeneticallyTrainedBird extends Bird {
    private BIAS = 0.3;

    private readonly chromosome: Chromosome;
    private readonly neuralNetwork: NeuralNetwork;

    public constructor(options: { initialPosition: Phaser.Geom.Point, scene: Phaser.Scene, id: number }, chromosome) {
        super(options, BirdType.GENETICALLY_TRAINED);
        this.chromosome = chromosome;
        this.neuralNetwork = new NeuralNetwork({
            inputs: [
                {
                    //verticalPosition
                    minValue: 0,
                    maxValue: dimensionHeight * scale,
                },
                {
                    //closestPipeGapVerticalPosition
                    minValue: 0,
                    maxValue: dimensionHeight * scale / 2,
                },
                {
                    //horizontalDistanceToClosestPipe
                    minValue: -dimensionWidth * scale / 4,
                    maxValue: dimensionWidth * scale / 2,
                }],
            hiddenNeurons: 4,
            outputs: 1,
            weights: this.chromosome ? this.chromosome.genes : null
        });
        if (!this.chromosome) {
            this.chromosome = {genes: this.neuralNetwork.randomlyGenerateBrain()};
        }
    }

    protected handleBirdInput(data: {
        verticalPosition: number,
        closestPipeGapVerticalPosition: number,
        horizontalDistanceToClosestPipe: number,
        delta: number
    }): boolean {
        const output = this.neuralNetwork.doTheMagic(data.verticalPosition,
            data.closestPipeGapVerticalPosition,
            data.horizontalDistanceToClosestPipe);
        if (output[0] > this.BIAS) {
            this.commands.push(Commands.FLAP_WING);
            return true;
        }
        return false;
    }

    protected dataToSendOnBirdDeath(): any {
        return this.chromosome;
    }
}
