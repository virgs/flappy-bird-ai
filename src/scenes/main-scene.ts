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
import {GeneticallyTrainedBird} from '../actors/birds/genetically-trained-bird';
import {PlayerControlledBird} from '../actors/birds/player-controlled-bird';
import {BirdType} from '../actors/birds/bird';
import {SupervisedTrainedBird} from '../actors/birds/supervised-trained-bird';

export class MainScene extends Phaser.Scene {
    private birdsResults: { type: BirdType, duration: number }[] = [];
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
        EventManager.on(Events.BIRD_DIED, (options: { type: BirdType, data: any }) => this.onAnyBirdDeath(options));
        this.endGameKey = this.input.keyboard.addKey(KeyCodes.ESC);
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
        new SupervisedTrainedBird({
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

    private onAnyBirdDeath(options: { type: BirdType, data: any }) {
        --this.livingBirdsCounter;
        const birdResult = {type: options.type, duration: this.sceneDuration, data: options.data};
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
