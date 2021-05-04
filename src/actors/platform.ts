import {scale} from '../scale';
import {EventManager} from '../event-manager/event-manager';
import {Events} from '../event-manager/events';
import {dimensionHeight, dimensionWidth} from '../game';

export class Platform {
    private readonly assetsWidthDifference = 120;
    private readonly backgroundTextureKeys = ['background-night.png', 'background-day.png'];
    private readonly floorTextureKey = 'floor.png';

    private readonly backgroundSprites: Phaser.GameObjects.Sprite[] = [];
    private readonly floorSprites: Phaser.GameObjects.Sprite[] = [];

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
    }

    private createBackgroundSprites(options: { scene: Phaser.Scene }) {
        const chosenTextureKey = this.backgroundTextureKeys[Math.floor(Math.random() * 2)];
        const firstSprite = options.scene.add.sprite(0, 0, chosenTextureKey);
        firstSprite.displayOriginX = 0;
        firstSprite.displayOriginY = 0;
        firstSprite.setScale(scale);
        this.backgroundSprites.push(firstSprite);

        const secondSprite = options.scene.add.sprite(firstSprite.width * scale, 0, chosenTextureKey);
        secondSprite.displayOriginX = 0;
        secondSprite.displayOriginY = 0;
        secondSprite.setScale(scale);
        this.backgroundSprites.push(secondSprite);
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
