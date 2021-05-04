import {scale} from '../scale';

export class Pipe {
    private readonly topPipeTextureKey = 'top-pipe.png';
    private readonly bottomPipeTextureKey = 'bottom-pipe.png';
    private readonly gapInPixels = 150;

    private pipesSprites: Phaser.GameObjects.Sprite[] = [];

    constructor(options: { scene: Phaser.Scene }) {
        const topPipeSprite = options.scene.add.sprite(120, 0, this.topPipeTextureKey);
        topPipeSprite.displayOriginX = 0;
        topPipeSprite.displayOriginY = 0;
        topPipeSprite.setScale(scale);
        this.pipesSprites.push(topPipeSprite);

        const bottomPipeSprite = options.scene.add.sprite(120, 500 + this.gapInPixels, this.bottomPipeTextureKey);
        bottomPipeSprite.displayOriginX = 0;
        bottomPipeSprite.displayOriginY = 0;
        bottomPipeSprite.setScale(scale);
        this.pipesSprites.push(bottomPipeSprite);
    }

    public destroy() {
        this.pipesSprites.forEach(sprite => sprite.destroy());
    }
}
