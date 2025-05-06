import { Scene } from 'phaser'
import { gameConstants } from '../GameConstants'

export class PreloaderScene extends Scene {
    // private birdSprite: Phaser.GameObjects.Sprite

    constructor() {
        super('Preloader')
    }

    preload() {
        Object.keys(gameConstants.assets).forEach(key => {
            const asset = gameConstants.assets[key as keyof typeof gameConstants.assets]
            this.load.image(asset.name, asset.path)
        })
        //  Load the sprite sheet
        //  The sprite sheet is a collection of images that are used to create animations
        Object.keys(gameConstants.spriteSheet.assets).forEach(key => {
            const asset = gameConstants.spriteSheet.assets[key as keyof typeof gameConstants.spriteSheet.assets]
            const { frameWidth, frameHeight } = gameConstants.spriteSheet
            this.load.spritesheet(asset.name, asset.path, { frameWidth, frameHeight })
        })
    }

    create() {
        // this.children.removeAll(true)

        //  When all the assets have loaded, it's often worth creating global objects here that the rest of the game can use.
        //  For example, you can define global animations here, so we can use them in other scenes.
        //  Move to the MainMenu. You could also swap this for a Scene Transition, such as a camera fade.
        this.scene.start('GameScene')
    }

    // private createSprite(): Phaser.GameObjects.Sprite {
    //     const resourceKey = constants.spriteSheet.assets.birdYellow.name
    //     const birdSprite = this.add.sprite(
    //         constants.gameDimensions.width / 2,
    //         constants.gameDimensions.height / 2,
    //         resourceKey
    //     )
    //     // birdSprite.setScale(0.5)
    //     if (!this.anims.get(resourceKey)) {
    //         this.anims.create({
    //             key: resourceKey,
    //             frames: this.anims.generateFrameNumbers(resourceKey, {
    //                 start: constants.spriteSheet.frameNumbers.start,
    //                 end: constants.spriteSheet.frameNumbers.end,
    //             }),
    //             frameRate: constants.spriteSheet.animation.frameRate,
    //             repeat: constants.spriteSheet.animation.repeat,
    //         })
    //     }
    //     birdSprite.anims.play(resourceKey)
    //     return birdSprite
    // }
}
