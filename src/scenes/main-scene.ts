import {Platform} from '../actors/platform';
import {EventManager} from '../event-manager/event-manager';
import {Pipe} from '../actors/pipe';

export class MainScene extends Phaser.Scene {

    // private snake: Snake;
    private platform: Platform;
    private pipes: Pipe[] = [];
    private gameRunning: boolean;

    constructor() {
        super({
            key: 'MainScene'
        });
    }

    public async create(): Promise<void> {
        this.gameRunning = true;
        this.platform = new Platform({scene: this});
        this.pipes.push(new Pipe({scene: this}));

        // EventManager.emit(Events.GAME_BEGAN);
        // EventManager.on(Events.GAME_OVER, score => {
        //     this.gameRunning = false;
        //     setTimeout(() => {
        //         this.destroy();
        //         this.scene.start('ScoreScene', {score});
        //     }, 2000);
        // });
    }

    public update(time: number, delta: number): void {
        if (this.gameRunning) {
            // this.snake &&this.snake.update(delta);
        }
    }

    private destroy() {
        EventManager.destroy();
        // this.snake.destroy();
        this.platform.destroy();
        // this.holes.forEach(hole => hole.destroy());
    }

}
