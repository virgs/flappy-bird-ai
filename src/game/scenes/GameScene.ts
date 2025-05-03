import { Scene } from 'phaser'
import { BirdSettings } from '../../settings/BirdSettings'
import { GameSettings } from '../../settings/GameSettings'
import { sleep } from '../../time/sleep'
import { BirdFactory } from '../actors/BirdFactory'
import { Bird } from '../actors/Birds'
import { Obstacle } from '../actors/Obstacle'
import { Platform } from '../actors/Platform'
import { constants } from '../Constants'
import { EventBus } from '../EventBus'

export type GameSceneOutput = {
    aborted: boolean
    birdPerformance?: BirdPerformance
}

export type ResultData = {
    [key: string]: {
        timeAlive: number
    }[]
}
export class BirdPerformance {
    private readonly result: ResultData = {}
    public constructor(settings: GameSettings) {
        Object.keys(settings).forEach(key => {
            const playerSettings = settings[key as keyof GameSettings]
            this.result[playerSettings.key] = []
        })
    }

    public computeDeath(birdSettings: BirdSettings, timeAlive: number) {
        this.result[birdSettings.key].push({ timeAlive: timeAlive })
    }
    public getResults(): ResultData {
        return this.result
    }
}

export class GameScene extends Scene {
    private readonly obstacleIntervalsInSeconds: number =
        constants.obstacles.horizontalGap / constants.physics.horizontalVelocityInPixelsPerSecond
    private gameOver: boolean = false
    private obstacles: Obstacle[] = []
    private birds: Bird[] = []
    private sceneDuration: number = 0
    private platform: Platform
    private secondsSinceLastObstacleCreation: number = 0
    private closestObstacleIndex: number = 0
    private birdPerformance: BirdPerformance
    private birdSettings: GameSettings

    constructor() {
        super('GameScene')
    }

    public create(gameSettings: GameSettings) {
        EventBus.emit('current-scene-ready', this)
        this.birdSettings = gameSettings
        this.birdPerformance = new BirdPerformance(gameSettings)
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

        this.birds = BirdFactory.createBirds(this, gameSettings, (bird: BirdSettings) => {
            this.birdPerformance.computeDeath(bird, this.sceneDuration)
        })
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
            if (this.birdSettings.human?.enabled) {
                await sleep(2000)
            }
            this.gameOver = true
            this.scene.start('EvaluationScene', this.birdPerformance.getResults())
        }
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
        this.destroy()
        const output: GameSceneOutput = {
            aborted: true,
            birdPerformance: undefined,
        }
        this.scene.start('EvaluationScene', output)
    }

    private destroy() {
        this.obstacles.forEach(pipe => pipe.destroy())
        this.platform.destroy()
        this.birds.forEach(bird => bird.destroy())
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
