import { PlayerSettings } from '../../settings/PlayerSettings'
import { Platform } from '../actors/Platform'
import { constants } from '../constants'
import { EventBus } from '../EventBus'
import { Scene, Geom, Input } from 'phaser'

export class GameScene extends Scene {
    private readonly birdsInitialPosition = new Geom.Point(
        constants.birdAttributes.initialPosition.x,
        constants.birdAttributes.initialPosition.y
    )
    // private birdsResults: { attributes: BirdAttributes; duration: number; id: number; data: any }[] = []
    private secondsToCreateNextPipe: number =
        constants.pipes.averageHorizontalGapInPixels / constants.pipes.horizontalVelocityInPixelsPerSecond
    private pipesCreated: number = 0
    private sceneDuration: number = 0
    private livingBirdsCounter: number = 0
    private endGameKey?: Phaser.Input.Keyboard.Key
    private platform: Platform

    constructor() {
        super('GameScene')
    }

    create() {
        EventBus.emit('current-scene-ready', this)
        this.endGameKey = this.input.keyboard?.addKey(Input.Keyboard.KeyCodes.ESC)
        this.platform = new Platform({ scene: this })
    }

    init(data: any) {
        // this.createBirds(data)
        // new Pipe({
        //     scene: this,
        //     identifier: ++this.pipesCreated,
        //     closestPipeToTheBird: true,
        //     birdXPosition: birdXPosition,
        // })
    }

    update(time: number, delta: number): void {
        this.sceneDuration += delta
        if (this.endGameKey?.isDown) {
            this.changeScene()
        }
        this.platform.update({
            delta: delta,
        })
        // this.updateBirds(delta)
        // this.updatePipes(delta)
        // this.updateScore(delta)
    }

    changeScene() {
        this.scene.start('GameOver')
    }
}
