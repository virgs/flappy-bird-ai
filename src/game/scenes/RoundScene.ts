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

    constructor() {
        super('RoundScene')
    }

    public create(roundSettings: RoundSettings) {
        EventBus.emit('update-current-scene', this)

        this.gameIsOver = false
        this.roundSettings = roundSettings
        this.roundEngine = new RoundEngine(this, roundSettings)
    }

    public async update(_time: number, delta: number): Promise<void> {
        if (this.gameIsOver) {
            return
        }
        this.roundEngine.update(delta)
        if (this.roundEngine.isGameOver()) {
            this.gameIsOver = true
            if (this.roundSettings.birdSouls.some(bird => bird.props.type === BirdTypes.HUMAN)) {
                await sleep(gameConstants.scene.humanGameOverDelayInMs)
            }

            const results = this.roundEngine.getResults()
            this.roundEngine.destroy()
            this.scene.start('EvaluationScene', results)
        }
    }

    public abort() {
        this.roundEngine.destroy()
        this.roundEngine.abort()
        this.scene.start('EvaluationScene', this.roundEngine.getResults())
    }
}
