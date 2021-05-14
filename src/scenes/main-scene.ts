import Point = Phaser.Geom.Point;
import KeyCodes = Phaser.Input.Keyboard.KeyCodes;
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
import {SimulatedAnnealingTrainedBird} from '../actors/birds/simulated-annealing-trained-bird';
import {BirdAttributes} from '../actors/birds/bird-attributes';
import {GeneticallyTrainedBird} from '../actors/birds/genetically-trained-bird';
import {BirdQ} from '../actors/birds/bird-q';
import {scale} from '../scale';
import {PlayerControlledBird} from '../actors/birds/player-controlled-bird';

export class MainScene extends Phaser.Scene {
    private readonly birdsInitialPosition = new Point(birdXPosition, dimensionHeight / 4);
    private birdsResults: { attributes: BirdAttributes, duration: number, id: number, data: any }[] = [];
    private secondsToCreateNextPipe: number = averageGapIntervalBetweenPipesInPixels / horizontalVelocityInPixelsPerSecond;
    private pipesCreated: number = 0;
    private sceneDuration: number = 0;
    private livingBirdsCounter: number = 0;
    private endGameKey: Phaser.Input.Keyboard.Key;

    constructor() {
        super({
            key: 'MainScene'
        });
    }

    public async init(data: {
        geneticBirds: Chromosome[],
        qBirdsNumber: number,
        simulatedAnnealingNextPopulation: Chromosome[]
    }): Promise<void> {
        this.endGameKey = this.input.keyboard.addKey(KeyCodes.ESC);
        new Platform({scene: this});
        this.createBirds(data);
        new Pipe({
            scene: this,
            identifier: ++this.pipesCreated,
            closestPipeToTheBird: true,
            birdXPosition: birdXPosition
        });
        EventManager.on(Events.BIRD_DIED, (options: { attributes: BirdAttributes, data: any, id: number }) => this.onAnyBirdDeath(options));
    }

    private createBirds(data: {
        geneticBirds: Chromosome[],
        qBirdsNumber: number,
        simulatedAnnealingNextPopulation: Chromosome[]
    }) {
        data.geneticBirds
            .forEach((chromosome: Chromosome) => {
                new GeneticallyTrainedBird({
                    scene: this,
                    initialPosition: new Point(this.birdsInitialPosition.x + Math.random() * 20,
                        this.birdsInitialPosition.y),
                    id: this.livingBirdsCounter
                }, chromosome);
                ++this.livingBirdsCounter;
            });
        data.simulatedAnnealingNextPopulation
            .forEach((chromosome: Chromosome) => {
                new SimulatedAnnealingTrainedBird({
                    scene: this,
                    initialPosition: new Point(this.birdsInitialPosition.x,
                        this.birdsInitialPosition.y + dimensionHeight * 0.5),
                    id: this.livingBirdsCounter
                }, chromosome);
                ++this.livingBirdsCounter;
            });

        const verticalQBirdsOffset = dimensionHeight * 0.5 * (scale / data.qBirdsNumber || 1);
        Array.from(Array(data.qBirdsNumber))
            .forEach((_, index) => {
            new BirdQ({
                initialPosition: new Point(this.birdsInitialPosition.x + Math.random() * 100,
                    this.birdsInitialPosition.y + index * verticalQBirdsOffset),
                scene: this,
                id: this.livingBirdsCounter
            });
            ++this.livingBirdsCounter;
        });

        new PlayerControlledBird({
            initialPosition: new Point(this.birdsInitialPosition.x + 100, this.birdsInitialPosition.y),
            scene: this,
            id: this.livingBirdsCounter
        });
        ++this.livingBirdsCounter;
    }

    public update(time: number, elapsedTime: number): void {
        const delta = elapsedTime;
        this.sceneDuration += delta;
        EventManager.emit(Events.UPDATE, {delta: delta, pixelsPerSecond: horizontalVelocityInPixelsPerSecond});
        this.checkPipeCreation(delta);
        if (this.endGameKey.isDown) {
            EventManager.emit(Events.KILL_BIRDS);
        }
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

    private onAnyBirdDeath(options: { attributes: BirdAttributes; data: any; id: number }) {
        --this.livingBirdsCounter;
        const birdResult = {attributes: options.attributes, duration: this.sceneDuration, data: options.data, id: options.id};
        this.birdsResults.push(birdResult);

        if (this.livingBirdsCounter === 0) {
            this.endGeneration();
        }
    }

    private endGeneration() {
        this.scene.pause();
        setTimeout(() => {
            this.scene.start('SplashScene', {
                results: this.birdsResults
            });
            this.destroy();
        }, 200);
    }

    private destroy() {
        this.birdsResults = [];
        this.livingBirdsCounter = 0;
        this.secondsToCreateNextPipe = averageGapIntervalBetweenPipesInPixels / horizontalVelocityInPixelsPerSecond;
        this.pipesCreated = 0;
        this.sceneDuration = 0;

        EventManager.emit(Events.DESTROY);
        EventManager.destroy();
    }
}
