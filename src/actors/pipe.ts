import {scale} from '../scale';
import Point = Phaser.Geom.Point;
import {DEBUG_MODE} from '../constants';
import {Events} from '../event-manager/events';
import {dimensionHeight, dimensionWidth} from '../game';
import {EventManager} from '../event-manager/event-manager';

export class Pipe {
    private readonly gapInPixels = 80;
    private readonly topPipeTextureKey = 'top-pipe';
    private readonly bottomPipeTextureKey = 'bottom-pipe';
    private readonly id: number;
    private readonly verticalOffset: number;
    private readonly pipesSprites: Phaser.GameObjects.Sprite[] = [];
    private readonly birdXPosition: number;

    private closestPipeToTheBird: boolean;
    private alive: boolean = true;

    constructor(options: { scene: Phaser.Scene, identifier, closestPipeToTheBird, birdXPosition }) {
        this.birdXPosition = options.birdXPosition;
        this.id = options.identifier;

        this.verticalOffset = (Math.random() * (dimensionHeight / 2)) - dimensionHeight / 2;
        const position = new Point(dimensionWidth * scale, this.verticalOffset * scale);
        this.createSprites(options, position);
        this.registerInEvents();
        if (options.closestPipeToTheBird) {
            this.setAsClosestToTheBird();
        }
    }

    private createSprites(options: { scene: Phaser.Scene; identifier; closestPipeToTheBird }, position: Phaser.Geom.Point) {
        const topPipeSprite = options.scene.add.sprite(position.x, position.y, this.topPipeTextureKey);
        topPipeSprite.displayOriginX = 0;
        topPipeSprite.displayOriginY = 0;
        topPipeSprite.setScale(scale);
        this.pipesSprites.push(topPipeSprite);

        const bottomPipeSprite = options.scene.add.sprite(position.x,
            position.y + ((topPipeSprite.height + this.gapInPixels) * scale), this.bottomPipeTextureKey);
        bottomPipeSprite.displayOriginX = 0;
        bottomPipeSprite.displayOriginY = 0;
        bottomPipeSprite.setScale(scale);
        this.pipesSprites.push(bottomPipeSprite);
    }

    private registerInEvents(): void {
        EventManager.on(Events.UPDATE, updateOptions => {
            if (this.alive) {
                this.update(updateOptions);
            }
        });
        EventManager.recover(Events.PIPE_BEYOND_BIRD, options => {
            if (this.id === options.destroyedPipeId + 1) {
                this.setAsClosestToTheBird();
            }
        });
    }

    private update(options: { delta, pixelsPerSecond }): void {
        this.pipesSprites
            .forEach(sprite => sprite.x -= options.delta * options.pixelsPerSecond);
        if (this.closestPipeToTheBird) {
            EventManager.emit(Events.CLOSEST_PIPE_MOVED, {
                sprites: this.pipesSprites,
                verticalOffset: this.verticalOffset + dimensionHeight * scale / 2
            });
            if (this.pipesSprites.every(sprite => sprite.getBounds().right < this.birdXPosition)) {
                this.closestPipeToTheBird = false;
                EventManager.emit(Events.PIPE_BEYOND_BIRD, {destroyedPipeId: this.id});
            }
        }
        if (this.pipesSprites.every(sprite => sprite.x + sprite.displayWidth < 0)) {
            this.pipesSprites.forEach(sprite => sprite.destroy());
            this.closestPipeToTheBird = false;
            this.alive = false;
        }
    }

    private setAsClosestToTheBird(): void {
        if (DEBUG_MODE) {
            this.pipesSprites.forEach(sprite => {
                sprite.setTint(0xFF880000);
                sprite.setAlpha(0.1);
            });
        }
        this.closestPipeToTheBird = true;
    }
}
