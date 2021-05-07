import {scale} from '../../scale';
import {Bird, BirdType, Commands} from './bird';
import {Chromosome} from '../chromosome';
import {Events} from '../../event-manager/events';
import {NeuralNetwork} from '../../ai/neural-network';
import {dimensionHeight, dimensionWidth} from '../../game';
import {EventManager} from '../../event-manager/event-manager';

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
                    //verticalDistanceToTheCenterOfClosestPipeGap
                    minValue: -dimensionHeight * scale,
                    maxValue: dimensionHeight * scale,
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
        verticalDistanceToTheCenterOfClosestPipeGap: number,
        horizontalDistanceToClosestPipe: number,
        delta: number
    }): boolean {
        const output = this.neuralNetwork.doTheMagic(data.verticalPosition,
            data.verticalDistanceToTheCenterOfClosestPipeGap,
            data.horizontalDistanceToClosestPipe);
        if (output[0] > this.BIAS) {
            this.commands.push(Commands.FLAP_WING);
            return true;
        }
        return false;
    }

    protected onBirdDeath() {
        EventManager.emit(Events.GENETICALLY_TRAINED_BIRD_DIED, {chromosome: this.chromosome});
    }
}
