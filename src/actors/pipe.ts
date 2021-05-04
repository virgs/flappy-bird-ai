import {scale} from '../scale';
import {GameActor, UpdateParams} from './game-actor';
import {dimensionHeight, dimensionWidth} from '../game';
import Point = Phaser.Geom.Point;

export class Pipe implements GameActor {
    private readonly topPipeTextureKey = 'top-pipe.png';
    private readonly bottomPipeTextureKey = 'bottom-pipe.png';
    private readonly gapInPixels = 50;
    private pipesSprites: Phaser.GameObjects.Sprite[] = [];

    constructor(options: { scene: Phaser.Scene }) {
        const randomVerticalOffset = (Math.random() * (dimensionHeight / 4)) - dimensionHeight / 4;
        const position = new Point(dimensionWidth * scale, randomVerticalOffset * scale);
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

    public update(options: UpdateParams): void {
        this.pipesSprites.forEach(sprite => sprite.x -= options.delta * options.pixelsPerSecond);
    }

    public destroy() {
        this.pipesSprites.forEach(sprite => sprite.destroy());
    }

    public shouldDestroy(): boolean {
        return this.pipesSprites.every(sprite => sprite.x + sprite.displayWidth < 0);
    }

}
