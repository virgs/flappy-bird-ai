import {scale} from '../scale';
import {dimensionHeight} from '../game';
import {Events} from '../event-manager/events';
import {EventManager} from '../event-manager/event-manager';

export const floorHeightInPixels = 18;

export class Platform {
    private readonly assetsWidthDifference = 121;
    private readonly backgroundTextureKeys = ['background-night', 'background-day'];
    private readonly floorTextureKey = 'floor';

    private readonly backgroundSprites: Phaser.GameObjects.Sprite[] = [];
    private readonly floorSprites: Phaser.GameObjects.Sprite[] = [];

    private alpha: number = 0;
    private alphaIsIncreasing: boolean = true;

    constructor(options: { scene: Phaser.Scene }) {
        this.createBackgroundSprites(options);
        this.createFloorSprites(options);

        EventManager.on(Events.UPDATE, updateOptions => this.update(updateOptions));
        EventManager.on(Events.DESTROY, () => {
            this.backgroundSprites.concat(this.floorSprites).forEach(sprite => sprite.destroy());
        });
    }

    private update(options): void {
        this.floorSprites
            .forEach(sprite => sprite.x -= options.delta * options.pixelsPerSecond);
        if (this.floorSprites.some(sprite => sprite.x < -this.assetsWidthDifference)) {
            this.floorSprites
                .forEach(sprite => sprite.x += this.assetsWidthDifference);
        }
        let increasingFactor = options.delta * 0.0001;
        if (!this.alphaIsIncreasing) {
            increasingFactor *= -1;
        }
        this.alpha += increasingFactor;
        if (this.alpha < 0) {
            this.alpha = 0;
            this.alphaIsIncreasing = true;
        } else if (this.alpha > 1) {
            this.alpha = 1;
            this.alphaIsIncreasing = false;
        }
        this.backgroundSprites
            .filter((_, index) => index >= this.backgroundSprites.length / 2)
            .forEach(sprite => {
                sprite.setAlpha(this.alpha);
            });
    }

    private createBackgroundSprites(options: { scene: Phaser.Scene }) {
        this.backgroundTextureKeys.forEach(textureKey => {
            const firstSprite = options.scene.add.sprite(0, 0, textureKey);
            firstSprite.displayOriginX = 0;
            firstSprite.displayOriginY = 0;
            firstSprite.setScale(scale);
            this.backgroundSprites.push(firstSprite);

            const secondSprite = options.scene.add.sprite(firstSprite.width * scale, 0, textureKey);
            secondSprite.displayOriginX = 0;
            secondSprite.displayOriginY = 0;
            secondSprite.setScale(scale);
            this.backgroundSprites.push(secondSprite);
        });
    }

    private createFloorSprites(options: { scene: Phaser.Scene }) {
        const firstFloorSprite = options.scene.add.sprite(0, dimensionHeight * scale, this.floorTextureKey);
        firstFloorSprite.setScale(scale);
        firstFloorSprite.displayOriginX = 0;
        firstFloorSprite.displayOriginY = 0;
        firstFloorSprite.y = dimensionHeight * scale - firstFloorSprite.displayHeight / 3;
        this.floorSprites.push(firstFloorSprite);

        const secondFloorSprite = options.scene.add.sprite(0, dimensionHeight * scale, this.floorTextureKey);
        secondFloorSprite.setScale(scale);
        secondFloorSprite.displayOriginX = 0;
        secondFloorSprite.displayOriginY = 0;
        secondFloorSprite.x = firstFloorSprite.displayWidth;
        secondFloorSprite.y = dimensionHeight * scale - secondFloorSprite.displayHeight / 3;
        this.floorSprites.push(secondFloorSprite);
    }
}
