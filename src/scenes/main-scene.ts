import {Pipe} from '../actors/pipe';
import {Platform} from '../actors/platform';
import {EventManager} from '../event-manager/event-manager';
import {Events} from '../event-manager/events';
import {scale} from '../scale';
import {Bird} from '../actors/bird';
import {dimensionHeight} from '../game';
import Point = Phaser.Geom.Point;

export class MainScene extends Phaser.Scene {

    private readonly averageGapIntervalBetweenPipes: number = 2.5 * 1000;
    private readonly randomFactorGapIntervalBetweenPipes: number = 1 * 1000;
    private readonly birdXPosition: number = 75 * scale;
    private readonly velocityInPixelsPerSecond: number = 0.15;

    private gameRunning: boolean;
    private secondsToCreateNextPipe: number = this.averageGapIntervalBetweenPipes;
    private pipesCreated: number = 0;

    constructor() {
        super({
            key: 'MainScene'
        });

    }

    public async create(): Promise<void> {
        this.gameRunning = true;
        new Platform({scene: this});
        new Bird({scene: this, initialPosition: new Point(this.birdXPosition, dimensionHeight / 2)});
        new Pipe({
            scene: this,
            identifier: ++this.pipesCreated,
            closestPipeToTheBird: true,
            birdXPosition: this.birdXPosition
        });
    }

    public update(time: number, delta: number): void {
        if (this.gameRunning) {
            EventManager.emit(Events.UPDATE, {delta, pixelsPerSecond: this.velocityInPixelsPerSecond});
            this.checkPipeCreation(delta);
        }
    }

    private checkPipeCreation(delta: number) {
        this.secondsToCreateNextPipe -= delta;
        if (this.secondsToCreateNextPipe <= 0) {
            this.secondsToCreateNextPipe = Math.random() * this.randomFactorGapIntervalBetweenPipes + this.averageGapIntervalBetweenPipes;
            new Pipe({
                scene: this,
                identifier: ++this.pipesCreated,
                closestPipeToTheBird: false,
                birdXPosition: this.birdXPosition
            });

        }
    }

    private destroy() {
        EventManager.emit(Events.DESTROY);
        EventManager.destroy();
    }

}
