import { Scene } from 'phaser'
import { BirdActor } from '../actors/BirdActor'
import { ObstacleActor } from '../actors/ObstacleActor'
import { PlatformActor } from '../actors/PlatformActor'
import { EventBus, GameEvents } from '../EventBus'
import { gameConstants } from '../GameConstants'
import { RoundResult } from './RoundResult'
import { RoundSettings } from './RoundSettings'

export class RoundEngine {
    private readonly obstacleIntervalsInSeconds: number =
        gameConstants.obstacles.horizontalGapInPixels / gameConstants.physics.horizontalVelocityInPixelsPerMs
    private readonly platform: PlatformActor
    private readonly results: RoundResult
    private readonly scene: Scene
    private readonly roundIteration: number
    private gameOver: boolean = false
    private obstacles: ObstacleActor[] = []
    private birds: BirdActor[] = []
    private roundDuration: number = 0
    private secondsSinceLastObstacleCreation: number = 0
    private closestObstacleIndex: number = 0

    public constructor(scene: Scene, roundSettings: RoundSettings) {
        this.roundIteration = roundSettings.iteration
        this.scene = scene
        this.results = {
            aborted: false,
            birdResults: [],
        }
        this.platform = new PlatformActor({ scene: scene })
        this.birds = roundSettings.birdSouls.map(
            (birdProps, index) => new BirdActor({ props: birdProps, scene: scene, id: `bird-${index}` })
        )
        this.platform = new PlatformActor({ scene: scene })

        this.obstacles.push(
            new ObstacleActor({
                scene: scene,
            })
        )

        EventBus.on(GameEvents.NEXT_ITERATION, () => {
            this.birds.forEach(bird => {
                this.killBird(bird)
            })
        })
    }

    public update(delta: number): void {
        if (this.gameOver) {
            return
        }
        this.roundDuration += delta
        this.platform.update({
            delta: delta,
        })
        this.updateObstacles(delta)
        this.updateBirds(delta)
        this.checkGameOver()
    }

    public abortGame() {
        this.gameOver = true
        this.results.aborted = true
    }

    public abortRound() {
        this.gameOver = true
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
        EventBus.removeListener(GameEvents.NEXT_ITERATION)
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
            if (this.birds.some(bird => bird.isAlive())) {
                console.log('Passed pipe')
            }
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
                new ObstacleActor({
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
                roundIteration: this.roundIteration,
            })
            if (wasAlive && !bird.isAlive()) {
                this.killBird(bird)
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

    private killBird(bird: BirdActor) {
        bird.kill()
        if (this.results.birdResults.every(b => b.id !== bird.getId())) {
            this.results.birdResults.push({
                id: bird.getId(),
                bird: bird.getProps(),
                timeAlive: this.roundDuration,
                pipesPassed: bird.getPipesPassed(),
            })
        }
    }
}
