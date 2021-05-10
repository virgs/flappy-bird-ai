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
import {BirdQ} from '../actors/birds/bird-q';
import {scale} from '../scale';

export class MainScene extends Phaser.Scene {
    private readonly birdsInitialPosition = new Point(birdXPosition, dimensionHeight / 4);
    private birdsResults: { type: BirdType, duration: number }[] = [];
    private secondsToCreateNextPipe: number = averageGapIntervalBetweenPipesInPixels / horizontalVelocityInPixelsPerSecond;
    private pipesCreated: number = 0;
    private sceneDuration: number = 0;
    private livingBirdsCounter: number = 0;
    private endGameKey: Phaser.Input.Keyboard.Key;
    private readonly qBirdsAmount: number = 50;

    constructor() {
        super({
            key: 'MainScene'
        });
    }

    public async init(data: { birds: Chromosome[] }): Promise<void> {
        this.endGameKey = this.input.keyboard.addKey(KeyCodes.ESC);
        new Platform({scene: this});
        this.createBirds(data);
        new Pipe({
            scene: this,
            identifier: ++this.pipesCreated,
            closestPipeToTheBird: true,
            birdXPosition: birdXPosition
        });
        EventManager.on(Events.BIRD_DIED, (options: { type: BirdType, data: any }) => this.onAnyBirdDeath(options));
    }

    private createBirds(data: { birds: Chromosome[] }) {
        data.birds
            .forEach((chromosome: Chromosome) => {
                new GeneticallyTrainedBird({
                    scene: this,
                    initialPosition: new Point(this.birdsInitialPosition.x + Math.random() * 20 - 10,
                        this.birdsInitialPosition.y),
                    id: this.livingBirdsCounter
                }, chromosome);
                ++this.livingBirdsCounter;
            });

        const verticalQBirdsOffset = dimensionHeight * (scale / this.qBirdsAmount);
        Array.from(Array(this.qBirdsAmount)).forEach((_, index) => {
            new BirdQ({
                initialPosition: new Point(this.birdsInitialPosition.x + Math.random() * 20 - 10,
                    this.birdsInitialPosition.y + index * verticalQBirdsOffset),
                scene: this,
                id: this.livingBirdsCounter
            });
            ++this.livingBirdsCounter;
        });
        new PlayerControlledBird({
            initialPosition: new Point(this.birdsInitialPosition.x + 20, this.birdsInitialPosition.y),
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
