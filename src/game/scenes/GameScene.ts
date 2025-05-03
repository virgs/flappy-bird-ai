import { Geom, Scene } from 'phaser'
import { Obstacle } from '../actors/Obstacle'
import { Platform } from '../actors/Platform'
import { constants } from '../Constants'
import { EventBus } from '../EventBus'
import { HumanControlledBird } from '../actors/HumanControlledBird'
import { Bird } from '../actors/Birds'

export class GameScene extends Scene {
    private readonly birdsInitialPosition = new Geom.Point(
        constants.birdAttributes.initialPosition.x,
        constants.birdAttributes.initialPosition.y
    )
    private secondsToCreateNextPipe: number =
        constants.obstacles.averageHorizontalGapInPixels / constants.physics.horizontalVelocityInPixelsPerSecond
    private obstacles: Obstacle[] = []
    private birds: Bird[] = []
    private sceneDuration: number = 0
    private platform: Platform
    private closestObstacleIndex: number = 0
    private totalObstaclesCreated: number
    private livingBirdsCounter: number = 0

    constructor() {
        super('GameScene')
    }

    create(data: any) {
        console.log('GameScene scene create', data)
        EventBus.emit('current-scene-ready', this)
        this.obstacles = []
        this.birds = []
        this.totalObstaclesCreated = 0
        this.livingBirdsCounter = 0
        this.sceneDuration = 0
        this.closestObstacleIndex = 0
        this.platform = new Platform({ scene: this })

        this.obstacles.push(
            new Obstacle({
                scene: this,
            })
        )
        this.totalObstaclesCreated = 1

        this.birds.push(
            new HumanControlledBird({
                initialPosition: this.birdsInitialPosition,
                scene: this,
            })
        )
    }

    update(_time: number, delta: number): void {
        this.sceneDuration += delta
        this.platform.update({
            delta: delta,
        })
        this.updateObstacles(delta)
        this.updateBirds(delta)
        // this.updateScore(delta)
    }

    private updateBirds(delta: number) {
        this.birds.forEach(bird => {
            bird.update({
                delta: delta,
                closestObstacle: this.obstacles[this.closestObstacleIndex],
            })
        })
        this.birds = this.birds.filter(bird => {
            if (bird.isOutOfScreen()) {
                bird.destroy()
                return false
            }
            return true
        })
    }

    public abort() {
        this.obstacles.forEach(pipe => pipe.destroy())
        this.platform.destroy()
        this.scene.start('MathScene')
    }

    private updateObstacles(delta: number) {
        // Process pipes and remove those that are out of screen
        this.obstacles = this.obstacles.filter((pipe, index) => {
            // Update each pipe
            pipe.update({
                delta: delta,
                onPassedBirds: () => {
                    // Adjust closest pipe index when birds pass it
                    if (this.closestObstacleIndex === index) {
                        this.closestObstacleIndex++
                    }
                },
            })
            if (pipe.isOutOfScreen()) {
                // Remove out-of-screen pipes from the beginning of the array
                --this.closestObstacleIndex
                pipe.destroy()
                return false
            }

            // Check if pipe should be removed
            return true
        })

        this.secondsToCreateNextPipe -= delta
        if (this.secondsToCreateNextPipe <= 0) {
            this.totalObstaclesCreated++
            this.secondsToCreateNextPipe =
                constants.obstacles.averageHorizontalGapInPixels / constants.physics.horizontalVelocityInPixelsPerSecond
            this.obstacles.push(
                new Obstacle({
                    scene: this,
                })
            )
        }
    }
}
