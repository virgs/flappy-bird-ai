import { Scene } from 'phaser'
import { EventBus } from '../EventBus'
import { RoundEngine } from '../round/RoundEngine'
import { RoundSettings } from '../round/RoundSettings'
import { BirdTypes } from '../../settings/BirdSettings'
import { sleep } from '../../time/sleep'
import { gameConstants } from '../GameConstants'

export class RoundScene extends Scene {
    private roundEngine: RoundEngine
    private gameIsOver: boolean
    private roundSettings: RoundSettings
    private milisecondsElapsed: number

    constructor() {
        super('RoundScene')
    }

    public create(roundSettings: RoundSettings) {
        EventBus.emit('update-current-scene', this)

        this.milisecondsElapsed = 0
        this.gameIsOver = false
        this.roundSettings = roundSettings
        this.roundEngine = new RoundEngine(this, roundSettings)
    }

    public async update(_time: number, delta: number): Promise<void> {
        if (this.gameIsOver) {
            return
        }
        //https://gafferongames.com/game-physics/fix-your-timestep
        this.milisecondsElapsed += delta
        // max frame time to avoid spiral of death
        const maxFrameTime = gameConstants.physics.frameIntervalInMs * 2
        if (this.milisecondsElapsed > maxFrameTime) {
            this.milisecondsElapsed = maxFrameTime
        }

        while (this.milisecondsElapsed >= gameConstants.physics.frameIntervalInMs) {
            this.milisecondsElapsed -= gameConstants.physics.frameIntervalInMs
            this.updateFrame(gameConstants.physics.frameIntervalInMs)
        }
    }
    public async updateFrame(delta: number) {
        this.roundEngine.update(delta)
        if (this.roundEngine.isGameOver() && !this.gameIsOver) {
            this.gameIsOver = true
            if (this.roundSettings.birdSouls.some(bird => bird.props.type === BirdTypes.HUMAN)) {
                console.log('Game over, waiting for human game over delay')
                await sleep(gameConstants.scene.humanGameOverDelayInMs)
            }

            const results = this.roundEngine.getResults()
            this.roundEngine.destroy()
            this.scene.start('GameScene', results)
        }
    }

    public abort() {
        this.roundEngine.destroy()
        this.roundEngine.abort()
        this.scene.start('GameScene', this.roundEngine.getResults())
    }
}
