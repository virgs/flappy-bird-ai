import {scale} from '../scale';
import {GameActor, UpdateParams} from './game-actor';

export class Platform implements GameActor {
    private readonly backgroundTextureKeys = ['background-night.png', 'background-day.png'];

    private backgroundSprites: Phaser.GameObjects.Sprite[] = [];

    constructor(options: { scene: Phaser.Scene }) {
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

    // tslint:disable-next-line:no-empty
    public update(options: UpdateParams): void {
    }

    public destroy() {
        this.backgroundSprites.forEach(sprite => sprite.destroy());
    }

    public shouldDestroy(): boolean {
        return false;
    }

}
