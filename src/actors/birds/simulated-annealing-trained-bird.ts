import {scale} from '../../scale';
import {Chromosome} from '../chromosome';
import {Bird, Commands} from './bird';
import {NeuralNetwork} from '../../ai/neural-network';
import {dimensionHeight, dimensionWidth} from '../../game';
import {BirdValues} from './bird-attributes';

export class SimulatedAnnealingTrainedBird extends Bird {
    private readonly chromosome: Chromosome;
    private readonly neuralNetwork: NeuralNetwork;

    public constructor(options: { initialPosition: Phaser.Geom.Point, scene: Phaser.Scene, id: number }, chromosome) {
        super(options, BirdValues.SIMULATED_ANNEALING);
        this.chromosome = chromosome;
        this.neuralNetwork = new NeuralNetwork({
            inputs: 3,
            hiddenNeurons: 6,
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
        const inputValues = [data.verticalPosition / (dimensionHeight * scale),
            data.closestPipeGapVerticalPosition / (dimensionHeight * scale),
            data.horizontalDistanceToClosestPipe / (dimensionWidth * scale)];
        const output = this.neuralNetwork.doTheMagic(inputValues);
        if (output[0] > -0.2) {
            this.commands.push(Commands.FLAP_WING);
            return true;
        }
        return false;
    }

    protected onBirdDeath(): any {
        return this.chromosome;
    }

}
