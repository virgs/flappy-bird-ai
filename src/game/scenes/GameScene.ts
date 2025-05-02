import { Geom, Scene } from 'phaser'
import { Pipe } from '../actors/pipe'
import { Platform } from '../actors/Platform'
import { constants } from '../Constants'
import { EventBus } from '../EventBus'

export class GameScene extends Scene {
    private readonly birdsInitialPosition = new Geom.Point(
        constants.birdAttributes.initialPosition.x,
        constants.birdAttributes.initialPosition.y
    )
    // private birdsResults: { attributes: BirdAttributes; duration: number; id: number; data: any }[] = []
    private secondsToCreateNextPipe: number =
        constants.pipes.averageHorizontalGapInPixels / constants.physics.horizontalVelocityInPixelsPerSecond
    private pipesCreated: number
    private sceneDuration: number = 0
    private livingBirdsCounter: number = 0
    private platform: Platform
    private readonly pipes: Pipe[] = []
    private closestPipeIndex: number = 0

    constructor() {
        super('GameScene')
    }

    create(data: any) {
        console.log('GameScene scene create', data)
        EventBus.emit('current-scene-ready', this)
        this.pipes.slice(0, this.pipes.length)
        this.pipesCreated = 0
        this.livingBirdsCounter = 0
        this.sceneDuration = 0
        this.closestPipeIndex = 0
        this.platform = new Platform({ scene: this })

        this.pipes.push(
            new Pipe({
                scene: this,
            })
        )
        this.pipesCreated = 1
        // this.createBirds(data)
    }

    update(_time: number, delta: number): void {
        this.sceneDuration += delta
        this.platform.update({
            delta: delta,
        })
        this.updatePipes(delta)

        // this.updateBirds(delta)
        // this.updatePipes(delta)
        // this.updateScore(delta)
    }

    abort() {
        this.pipes.forEach(pipe => pipe.destroy())
        this.platform.destroy()
        this.scene.start('MathScene')
    }

    private updatePipes(delta: number) {
        // Process pipes and remove those that are out of screen
        const outOfScreenPipesCount = this.pipes.filter((pipe, index) => {
            // Update each pipe
            pipe.update({
                delta: delta,
                onPassedBirds: () => {
                    // Adjust closest pipe index when birds pass it
                    if (this.closestPipeIndex === index) {
                        this.closestPipeIndex++
                    }
                },
            })

            // Check if pipe should be removed
            return pipe.isOutOfScreen()
        }).length

        // Remove out-of-screen pipes from the beginning of the array
        if (outOfScreenPipesCount > 0) {
            // Remove the pipes that are out of screen
            this.pipes.splice(0, outOfScreenPipesCount)
            this.closestPipeIndex -= outOfScreenPipesCount
        }

        this.secondsToCreateNextPipe -= delta
        if (this.secondsToCreateNextPipe <= 0) {
            this.pipesCreated++
            this.secondsToCreateNextPipe =
                constants.pipes.averageHorizontalGapInPixels / constants.physics.horizontalVelocityInPixelsPerSecond
            this.pipes.push(
                new Pipe({
                    scene: this,
                })
            )
        }
    }
}
