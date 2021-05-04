import {Pipe} from '../actors/pipe';
import {Platform} from '../actors/platform';
import {EventManager} from '../event-manager/event-manager';
import {Events} from '../event-manager/events';
import {Bird} from '../actors/bird';
import {dimensionHeight} from '../game';
import {averageGapIntervalBetweenPipes, birdXPosition, randomFactorGapIntervalBetweenPipes, velocityInPixelsPerSecond} from '../constants';
import Point = Phaser.Geom.Point;

export class MainScene extends Phaser.Scene {
    private readonly results: any[] = [];
    private secondsToCreateNextPipe: number = averageGapIntervalBetweenPipes;
    private pipesCreated: number = 0;
    private sceneDuration: number = 0;

    constructor() {
        super({
            key: 'MainScene'
        });
    }

    public async init(data): Promise<void> {
        console.log('main: ' + JSON.stringify(data));
        let livingBirdsCounter = data.birds.length;
        new Platform({scene: this});
        data.birds.forEach((chromosome, id) => new Bird({
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
        EventManager.on(Events.BIRD_DIED, chromosome => {
            --livingBirdsCounter;
            const birdResult = {chromosome: chromosome, result: this.sceneDuration};
            this.results.push(birdResult);
            if (livingBirdsCounter === 0) {
                this.destroy();
                this.scene.start('SplashScene', {results: this.results});
            }
        });
    }

    public update(time: number, delta: number): void {
        this.sceneDuration += delta;
        EventManager.emit(Events.UPDATE, {delta, pixelsPerSecond: velocityInPixelsPerSecond});
        this.checkPipeCreation(delta);
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

    private destroy() {
        EventManager.emit(Events.DESTROY);
        EventManager.destroy();
    }

}
