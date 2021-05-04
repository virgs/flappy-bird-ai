import {scale} from '../scale';

export class Platform {
    private readonly backgroundTextureKeys = ['background-night.png', 'background-day.png'];

    private backgroundSprites: Phaser.GameObjects.Sprite[] = [];

    constructor(options: { scene: Phaser.Scene }) {
        const chosenTextureKey = this.backgroundTextureKeys[Math.floor(Math.random() * 2)];
        const firstSprite = options.scene.add.sprite(0, 0, chosenTextureKey);
        firstSprite.displayOriginX = 0;
        firstSprite.displayOriginY = 0;
        firstSprite.setScale(scale);
        this.backgroundSprites.push(firstSprite);

        const secondSprite = options.scene.add.sprite(144 * scale, 0, chosenTextureKey);
        secondSprite.displayOriginX = 0;
        secondSprite.displayOriginY = 0;
        secondSprite.setScale(scale);
        this.backgroundSprites.push(secondSprite);
    }

    public destroy() {
        this.backgroundSprites.forEach(sprite => sprite.destroy());
    }

}
