import { Scene } from 'phaser'
import { constants } from '../constants'

export class Boot extends Scene {
    constructor() {
        super('Boot')
    }

    preload() {
        //  The Boot Scene is typically used to load in any assets you require for your Preloader, such as a game logo or background.
        //  The smaller the file size of the assets, the better, as the Boot Scene itself has no preloader.

        console.log('Boot Scene preloaded')
        const birdYellow = constants.spriteSheet.assets.birdYellow
        console.log('Loading sprite sheet:', birdYellow.path)
        const { frameWidth, frameHeight } = constants.spriteSheet
        this.load.spritesheet(birdYellow.name, birdYellow.path, { frameWidth, frameHeight })
    }

    create() {
        console.log('Boot Scene created')
        this.scene.start('Preloader')
    }
}
