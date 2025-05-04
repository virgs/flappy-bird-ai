import { Scene } from 'phaser'
import { GameSettings } from '../../settings/GameSettings'
import { sleep } from '../../time/sleep'
import { BirdFactory } from '../actors/BirdFactory'
import { Bird } from '../actors/Birds'
import { Obstacle } from '../actors/Obstacle'
import { Platform } from '../actors/Platform'
import { EventBus } from '../EventBus'
import { gameConstants } from '../GameConstants'

export type RoundResult = {
    gameSettings: GameSettings
    aborted: boolean
    birdPerformances: {
        bird: Bird
        timeAlive: number
    }[]
}

export class GameScene extends Scene {
    private readonly obstacleIntervalsInSeconds: number =
        gameConstants.obstacles.horizontalGapInPixels / gameConstants.physics.horizontalVelocityInPixelsPerSecond
    private gameOver: boolean = false
    private obstacles: Obstacle[] = []
    private birds: Bird[] = []
    private sceneDuration: number = 0
    private platform: Platform
    private secondsSinceLastObstacleCreation: number = 0
    private closestObstacleIndex: number = 0
    private output: RoundResult
    private gameSettings: GameSettings

    constructor() {
        super('GameScene')
    }

    public create(gameSettings: GameSettings) {
        EventBus.emit('current-scene-ready', this)
        this.gameSettings = gameSettings
        this.output = {
            aborted: false,
            gameSettings: gameSettings,
            birdPerformances: [],
        }
        this.obstacles = []
        this.birds = []
        this.gameOver = false
        this.secondsSinceLastObstacleCreation = 0
        this.sceneDuration = 0
        this.closestObstacleIndex = 0
        this.platform = new Platform({ scene: this })

        this.obstacles.push(
            new Obstacle({
                scene: this,
            })
        )

        this.birds = BirdFactory.createBirds(this, gameSettings)
    }

    public update(_time: number, delta: number): void {
        if (this.gameOver) {
            return
        }
        this.sceneDuration += delta
        this.platform.update({
            delta: delta,
        })
        this.updateObstacles(delta)
        this.updateBirds(delta)
        this.checkGameOver()
    }

    private async checkGameOver() {
        if (this.birds.length === 0) {
            if (this.gameSettings.humanSettings.enabled) {
                await sleep(2000)
            }
            this.gameOver = true
            this.scene.start('EvaluationScene', this.output)
        }
    }

    private updateBirds(delta: number) {
        this.birds.forEach(bird => {
            const wasAlive = bird.isAlive()
            bird.update({
                delta: delta,
                closestObstacle: this.obstacles[this.closestObstacleIndex],
            })
            if (wasAlive && !bird.isAlive()) {
                this.output.birdPerformances.push({
                    bird: bird,
                    timeAlive: this.sceneDuration,
                })
            }
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
        this.destroy()
        const output: RoundResult = {
            aborted: true,
            birdPerformances: [],
            gameSettings: this.gameSettings,
        }
        this.scene.start('EvaluationScene', output)
    }

    private destroy() {
        this.obstacles.forEach(pipe => pipe.destroy())
        this.platform.destroy()
        this.birds.forEach(bird => bird.destroy())
    }

    private updateObstacles(delta: number) {
        // Check if the bird has passed the pipes
        const closestObstacleHitBoxes = this.obstacles[this.closestObstacleIndex].getHitBoxes()
        if (this.birds.every(bird => closestObstacleHitBoxes.every(pipe => bird.getHitBox().left > pipe.right))) {
            this.closestObstacleIndex++
        }

        // Process pipes and remove those that are out of screen
        this.obstacles = this.obstacles.filter(pipe => {
            // Update each pipe
            pipe.update({
                delta: delta,
            })
            if (pipe.isOutOfScreen()) {
                // Remove out-of-screen pipes from the beginning of the array
                --this.closestObstacleIndex
                if (this.closestObstacleIndex < 0) {
                    this.closestObstacleIndex = 0
                }
                pipe.destroy()
                return false
            }

            // Check if pipe should be removed
            return true
        })

        this.secondsSinceLastObstacleCreation += delta
        if (this.secondsSinceLastObstacleCreation >= this.obstacleIntervalsInSeconds) {
            this.secondsSinceLastObstacleCreation = 0
            this.obstacles.push(
                new Obstacle({
                    scene: this,
                })
            )
        }
    }
}
