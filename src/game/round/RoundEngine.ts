import { Scene } from 'phaser'
import { GameSettings } from '../../settings/GameSettings'
import { BirdFactory } from '../actors/BirdFactory'
import { Bird } from '../actors/Birds'
import { Obstacle } from '../actors/Obstacle'
import { Platform } from '../actors/Platform'
import { gameConstants } from '../GameConstants'
import { RoundResult } from './RoundResult'

export class RoundEngine {
    private readonly obstacleIntervalsInSeconds: number =
        gameConstants.obstacles.horizontalGapInPixels / gameConstants.physics.horizontalVelocityInPixelsPerSecond
    private readonly platform: Platform
    private readonly results: RoundResult
    private readonly scene: Scene
    private gameOver: boolean = false
    private obstacles: Obstacle[] = []
    private birds: Bird[] = []
    private sceneDuration: number = 0
    private secondsSinceLastObstacleCreation: number = 0
    private closestObstacleIndex: number = 0

    public constructor(gameSettings: GameSettings, scene: Scene) {
        this.scene = scene
        this.results = {
            aborted: false,
            gameSettings: gameSettings,
            birdResults: [],
        }
        this.platform = new Platform({ scene: scene })
        this.results = {
            aborted: false,
            gameSettings: gameSettings,
            birdResults: [],
        }
        this.obstacles = []
        this.birds = []
        this.gameOver = false
        this.secondsSinceLastObstacleCreation = 0
        this.sceneDuration = 0
        this.closestObstacleIndex = 0
        this.platform = new Platform({ scene: scene })

        this.obstacles.push(
            new Obstacle({
                scene: scene,
            })
        )

        this.birds = BirdFactory.createBirds(scene, gameSettings)
    }

    public update(delta: number): void {
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

    public abort() {
        this.gameOver = true
        this.results.aborted = true
    }

    public isGameOver(): boolean {
        return this.gameOver
    }

    public getResults(): RoundResult {
        return this.results
    }

    public destroy() {
        this.obstacles.forEach(pipe => pipe.destroy())
        this.platform.destroy()
        this.birds.forEach(bird => bird.destroy())
    }

    private updateObstacles(delta: number) {
        // Check if the bird has passed the pipes
        if (this.closestObstacleIndex >= this.obstacles.length || this.closestObstacleIndex < 0) {
            return
        }
        const closestObstacleHitBoxes = this.obstacles[this.closestObstacleIndex].getHitBoxes()
        if (this.birds.every(bird => closestObstacleHitBoxes.every(pipe => bird.getHitBox().left > pipe.right))) {
            this.birds.forEach(bird => {
                bird.passedPipe()
            })
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
                    scene: this.scene,
                })
            )
        }
    }

    private checkGameOver() {
        if (this.birds.length === 0) {
            this.gameOver = true
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
                this.results.birdResults.push({
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
}
