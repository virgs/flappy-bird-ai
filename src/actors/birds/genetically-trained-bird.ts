import {Bird, Commands} from './bird';
import {Chromosome} from '../chromosome';
import {NeuralNetwork} from '../../ai/neural-network';
import {dimensionHeight, dimensionWidth} from '../../game';
import {scale} from '../../scale';
import {EventManager} from '../../event-manager/event-manager';
import {Events} from '../../event-manager/events';

export class GeneticallyTrainedBird extends Bird {
    private readonly chromosome: Chromosome;
    private readonly brain: NeuralNetwork;

    public constructor(options: { initialPosition: Phaser.Geom.Point, scene: Phaser.Scene, id: number }, chromosome) {
        super(options, 'bird-yellow');
        this.chromosome = chromosome;
        this.brain = new NeuralNetwork({
            inputs: [
                {
                    //verticalDistanceToTheCenterOfClosestPipeGap
                    minValue: -dimensionHeight * scale,
                    maxValue: dimensionHeight * scale,
                },
                {
                    //horizontalDistanceToClosestPipe
                    minValue: 0,
                    maxValue: dimensionWidth * scale / 2,
                }],
            hiddenNeurons: 3,
            outputs: 1,
            weights: this.chromosome ? this.chromosome.genes : null
        });
        if (!this.chromosome) {
            this.chromosome = {genes: this.brain.randomlyGenerateBrain()};
        }
    }

    protected handleBirdInput(): boolean {
        if (this.closestPipe != null) {
            const verticalDistanceToTheCenterOfClosestPipeGap = this.hitBoxSprite.getCenter().y - this.closestPipe.verticalOffset;
            const horizontalDistanceToClosestPipe = this.closestPipe.sprites[0].x - this.hitBoxSprite.getCenter().x;
            const output = this.brain.doTheMagic(verticalDistanceToTheCenterOfClosestPipeGap, horizontalDistanceToClosestPipe);
            if (output[0] > 0.3) {
                this.commands.push(Commands.FLAP_WING);
                return true;
            }
        }
        return false;
    }

    protected onBirdDeath() {
        EventManager.emit(Events.GENETICALLY_TRAINED_BIRD_DIED, {chromosome: this.chromosome});
    }
}
