import {scale} from '../scale';
import {Events} from '../event-manager/events';
import {dimensionHeight, dimensionWidth} from '../game';
import {EventManager} from '../event-manager/event-manager';
import Point = Phaser.Geom.Point;

export class Pipe {
    private readonly gapInPixels = 80;
    private readonly topPipeTextureKey = 'top-pipe.png';
    private readonly bottomPipeTextureKey = 'bottom-pipe.png';
    private readonly id: number;
    private readonly verticalOffset: number;
    private readonly pipesSprites: Phaser.GameObjects.Sprite[] = [];
    private readonly birdXPosition: number;

    private closestPipeToTheBird: boolean;
    private alive: boolean = true;

    constructor(options: { scene: Phaser.Scene, identifier, closestPipeToTheBird, birdXPosition }) {
        this.birdXPosition = options.birdXPosition;
        this.id = options.identifier;
        this.closestPipeToTheBird = options.closestPipeToTheBird;

        this.verticalOffset = (Math.random() * (dimensionHeight / 2)) - dimensionHeight / 2;
        this.createSprites(options);
        this.registerInEvents();
    }

    private createSprites(options: { scene: Phaser.Scene; identifier; closestPipeToTheBird }) {
        const position = new Point(dimensionWidth * scale, this.verticalOffset * scale);
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
        EventManager.on(Events.PIPE_BEYOND_BIRD, options => {
            if (this.id === options.destroyedPipeId + 1) {
                this.closestPipeToTheBird = true;
            }
        });
    }

    private update(options: { delta, pixelsPerSecond }): void {
        this.pipesSprites
            .forEach(sprite => sprite.x -= options.delta * options.pixelsPerSecond);
        if (this.closestPipeToTheBird) {
            EventManager.emit(Events.CLOSEST_PIPE_MOVED, {
                sprites: this.pipesSprites,
                verticalOffset: this.verticalOffset
            });
            if (this.pipesSprites.every(sprite => sprite.x + sprite.displayWidth < this.birdXPosition)) {
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

}
