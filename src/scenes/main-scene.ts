import {Pipe} from '../actors/pipe';
import {Platform} from '../actors/platform';
import {EventManager} from '../event-manager/event-manager';
import {Events} from '../event-manager/events';
import {Bird} from '../actors/bird';
import {dimensionHeight} from '../game';
import Point = Phaser.Geom.Point;
import {averageGapIntervalBetweenPipes, birdXPosition, randomFactorGapIntervalBetweenPipes, velocityInPixelsPerSecond} from '../constants';

export class MainScene extends Phaser.Scene {
    private livingBirds: number = 3;
    private gameRunning: boolean;
    private secondsToCreateNextPipe: number = averageGapIntervalBetweenPipes;
    private pipesCreated: number = 0;

    constructor() {
        super({
            key: 'MainScene'
        });
    }

    public async create(): Promise<void> {
        this.gameRunning = true;
        new Platform({scene: this});
        Array.from(Array(this.livingBirds)).forEach((_, id) => new Bird({
            scene: this,
            initialPosition: new Point(birdXPosition, dimensionHeight / 2),
            id: id
        }));
        new Pipe({
            scene: this,
            identifier: ++this.pipesCreated,
            closestPipeToTheBird: true,
            birdXPosition: birdXPosition
        });
        EventManager.on(Events.BIRD_DIED, options => {
            --this.livingBirds;
            console.log('Living birds: ' + this.livingBirds);
        });
    }

    public update(time: number, delta: number): void {
        if (this.gameRunning) {
            EventManager.emit(Events.UPDATE, {delta, pixelsPerSecond: velocityInPixelsPerSecond});
            this.checkPipeCreation(delta);
        }
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
