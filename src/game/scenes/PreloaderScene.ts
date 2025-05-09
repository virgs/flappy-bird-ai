import { Scene } from 'phaser'
import { gameConstants } from '../GameConstants'

export class PreloaderScene extends Scene {
    // private birdSprite: Phaser.GameObjects.Sprite

    constructor() {
        super('Preloader')
    }

    preload() {
        Object.keys(gameConstants.audioAssets).forEach(key => {
            const asset = gameConstants.audioAssets[key as keyof typeof gameConstants.audioAssets]
            this.load.audio(asset.key, asset.path)
        })
        Object.keys(gameConstants.imageAssets).forEach(key => {
            const asset = gameConstants.imageAssets[key as keyof typeof gameConstants.imageAssets]
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
        this.scene.start('GameScene')
    }
}
