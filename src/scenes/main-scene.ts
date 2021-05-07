import Point = Phaser.Geom.Point;
import {Pipe} from '../actors/pipe';
import {dimensionHeight} from '../game';
import {Platform} from '../actors/platform';
import {Events} from '../event-manager/events';
import {Chromosome} from '../actors/chromosome';
import {EventManager} from '../event-manager/event-manager';
import {
    averageGapIntervalBetweenPipesInPixels,
    birdXPosition,
    horizontalVelocityInPixelsPerSecond,
    randomFactorGapIntervalBetweenPipesInPixels
} from '../constants';
import {GeneticallyTrainedBird} from '../actors/birds/genetically-trained-bird';
import {PlayerControlledBird} from '../actors/birds/player-controlled-bird';
import {PlayerTrainedBird} from '../actors/birds/player-trained-bird';
import {BirdType} from '../actors/birds/bird';

export class MainScene extends Phaser.Scene {
    private geneticallyTrainedResults: { chromosome: Chromosome, duration: number }[] = [];
    private birdsResults: { type: BirdType, duration: number }[] = [];
    private secondsToCreateNextPipe: number = averageGapIntervalBetweenPipesInPixels / horizontalVelocityInPixelsPerSecond;
    private pipesCreated: number = 0;
    private sceneDuration: number = 0;
    private livingBirdsCounter: number = 0;

    constructor() {
        super({
            key: 'MainScene'
        });
    }

    public async init(data: { birds: Chromosome[] }): Promise<void> {
        this.livingBirdsCounter = data.birds.length;
        new Platform({scene: this});
        this.createBirds(data);
        new Pipe({
            scene: this,
            identifier: ++this.pipesCreated,
            closestPipeToTheBird: true,
            birdXPosition: birdXPosition
        });
        EventManager.on(Events.BIRD_DIED, (data: { type: BirdType }) => this.onAnyBirdDeath(data));
        EventManager.on(Events.GENETICALLY_TRAINED_BIRD_DIED, (data: { chromosome: Chromosome }) => this.onGeneticallyTrainedBirdDeath(data));
    }

    private createBirds(data: { birds: Chromosome[] }) {
        const birdsInitialPosition = new Point(birdXPosition, dimensionHeight / 4);
        let birdsIdCounter: number = 0;
        data.birds
            .forEach((chromosome: Chromosome) =>
                new GeneticallyTrainedBird({
                    scene: this,
                    initialPosition: birdsInitialPosition,
                    id: birdsIdCounter++
                }, chromosome));

        ++this.livingBirdsCounter;
        new PlayerTrainedBird({
            initialPosition: new Point(birdsInitialPosition.x + 10, birdsInitialPosition.y),
            scene: this,
            id: birdsIdCounter++
        });
        ++this.livingBirdsCounter;
        new PlayerControlledBird({
            initialPosition: new Point(birdsInitialPosition.x + 20, birdsInitialPosition.y),
            scene: this,
            id: birdsIdCounter++
        });
    }

    public update(time: number, delta: number): void {
        this.sceneDuration += delta;
        EventManager.emit(Events.UPDATE, {delta: delta, pixelsPerSecond: horizontalVelocityInPixelsPerSecond});
        this.checkPipeCreation(delta);
        document.querySelector('#time-display').textContent = (this.sceneDuration / 1000).toFixed(1);
        document.querySelector('#living-birds').textContent = `${this.livingBirdsCounter}/${this.birdsResults.length + this.livingBirdsCounter}`;
    }

    private checkPipeCreation(delta: number) {
        this.secondsToCreateNextPipe -= delta;
        if (this.secondsToCreateNextPipe <= 0) {
            this.secondsToCreateNextPipe = Math.random() * randomFactorGapIntervalBetweenPipesInPixels +
                averageGapIntervalBetweenPipesInPixels / horizontalVelocityInPixelsPerSecond;
            new Pipe({
                scene: this,
                identifier: ++this.pipesCreated,
                closestPipeToTheBird: false,
                birdXPosition: birdXPosition
            });
        }
    }

    private onAnyBirdDeath(data: { type: BirdType }) {
        --this.livingBirdsCounter;
        const birdResult = {type: data.type, duration: this.sceneDuration};
        this.birdsResults.push(birdResult);

        if (this.livingBirdsCounter === 0) {
            this.endGeneration();
        }
    }

    private onGeneticallyTrainedBirdDeath(data: { chromosome: Chromosome }) {
        const birdResult = {chromosome: data.chromosome, duration: this.sceneDuration};
        this.geneticallyTrainedResults.push(birdResult);
    }

    private endGeneration() {
        this.scene.pause();
        setTimeout(() => {
            this.scene.start('SplashScene', {
                geneticallyTrainedResults: this.geneticallyTrainedResults,
                results: this.birdsResults
            });
            this.destroy();
        }, 200);
    }

    private destroy() {
        this.birdsResults = [];
        this.geneticallyTrainedResults = [];
        this.livingBirdsCounter = 0;
        this.secondsToCreateNextPipe = averageGapIntervalBetweenPipesInPixels / horizontalVelocityInPixelsPerSecond;
        this.pipesCreated = 0;
        this.sceneDuration = 0;

        EventManager.emit(Events.DESTROY);
        EventManager.destroy();
    }
}
