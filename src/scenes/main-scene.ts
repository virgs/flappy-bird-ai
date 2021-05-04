import {Pipe} from '../actors/pipe';
import {Platform} from '../actors/platform';
import {GameActor} from '../actors/game-actor';
import {EventManager} from '../event-manager/event-manager';

export class MainScene extends Phaser.Scene {

    // private snake: Snake;
    // private platform: Platform;
    // private pipes: Pipe[] = [];
    private readonly averageGapIntervalBetweenPipes: number = 1.65 * 1000;

    private gameRunning: boolean;
    private gameActors: GameActor[] = [];
    private velocityInPixelsPerSecond: number = 0.125;
    private secondsSinceLastPipe: number = 0;

    constructor() {
        super({
            key: 'MainScene'
        });
    }

    public async create(): Promise<void> {
        this.gameRunning = true;
        this.gameActors.push(new Platform({scene: this}));
        this.gameActors.push(new Pipe({scene: this}));
    }

    public update(time: number, delta: number): void {
        if (this.gameRunning) {
            this.gameActors.forEach(gameActor => gameActor.update({delta, pixelsPerSecond: this.velocityInPixelsPerSecond}));
            this.gameActors = this.gameActors.filter(gameActor => !gameActor.shouldDestroy());
            this.checkPipeCreation(delta);
        }
    }

    private checkPipeCreation(delta: number) {
        this.secondsSinceLastPipe += delta;
        if (this.secondsSinceLastPipe > this.averageGapIntervalBetweenPipes) {
            if (Math.random() > 0.9) {
                this.secondsSinceLastPipe = 0;
                this.gameActors.push(new Pipe({scene: this}));
            } else {
                this.secondsSinceLastPipe -= delta;
            }
        }
    }

    private destroy() {
        EventManager.destroy();
        this.gameActors.forEach(gameActor => gameActor.destroy());
    }

}
