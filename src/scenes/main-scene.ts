import Point = Phaser.Geom.Point;
import {Pipe} from '../actors/pipe';
import {Bird} from '../actors/bird';
import {dimensionHeight} from '../game';
import {Platform} from '../actors/platform';
import {Events} from '../event-manager/events';
import {Chromosome} from '../actors/chromosome';
import {EventManager} from '../event-manager/event-manager';
import {averageGapIntervalBetweenPipes, birdXPosition, horizontalVelocityInPixelsPerSecond, randomFactorGapIntervalBetweenPipes} from '../constants';

export class MainScene extends Phaser.Scene {
    private results: { chromosome: Chromosome, duration: number }[] = [];
    private secondsToCreateNextPipe: number = averageGapIntervalBetweenPipes;
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
        data.birds.forEach((chromosome: Chromosome, id) => new Bird({
            scene: this,
            initialPosition: new Point(birdXPosition, dimensionHeight / 2),
            id: id,
            chromosome: chromosome
        }));
        new Pipe({
            scene: this,
            identifier: ++this.pipesCreated,
            closestPipeToTheBird: true,
            birdXPosition: birdXPosition
        });
        EventManager.on(Events.BIRD_DIED, (data: { chromosome: Chromosome }) => this.onBirdDeath(data));
    }

    public update(time: number, delta: number): void {
        this.sceneDuration += delta;
        EventManager.emit(Events.UPDATE, {delta: delta, pixelsPerSecond: horizontalVelocityInPixelsPerSecond});
        this.checkPipeCreation(delta);
        document.querySelector('#time-display').textContent = (this.sceneDuration / 1000).toFixed(1);
    }

    private checkPipeCreation(delta: number) {
        this.secondsToCreateNextPipe -= delta;
        if (this.secondsToCreateNextPipe <= 0) {
            this.secondsToCreateNextPipe = Math.random() * randomFactorGapIntervalBetweenPipes + averageGapIntervalBetweenPipes;
            new Pipe({
                scene: this,
                identifier: ++this.pipesCreated,
                closestPipeToTheBird: false,
                birdXPosition: birdXPosition
            });
        }
    }

    private onBirdDeath(data: { chromosome: Chromosome }) {
        const birdResult = {chromosome: data.chromosome, duration: this.sceneDuration};
        --this.livingBirdsCounter;
        this.results.push(birdResult);
        if (this.livingBirdsCounter === 0) {
            this.endGeneration();
        }
    }

    private endGeneration() {
        this.scene.pause();
        setTimeout(() => {
            this.scene.start('SplashScene', {results: this.results});
            this.destroy();
        }, 200);
    }

    private destroy() {
        this.results = [];
        this.livingBirdsCounter = 0;
        this.secondsToCreateNextPipe = averageGapIntervalBetweenPipes;
        this.pipesCreated = 0;
        this.sceneDuration = 0;

        EventManager.emit(Events.DESTROY);
        EventManager.destroy();
    }
}
