import { Scene } from 'phaser'
import { GameSettings } from '../../settings/GameSettings'
import { sleep } from '../../time/sleep'
import { EventBus } from '../EventBus'
import { RoundEngine } from '../round/RoundEngine'

export class RoundScene extends Scene {
    private gameEngine: RoundEngine
    private gameSettings: GameSettings

    constructor() {
        super('RoundScene')
    }

    public create(gameSettings: GameSettings) {
        EventBus.emit('update-current-scene', this)
        this.gameSettings = gameSettings
        this.gameEngine = new RoundEngine(gameSettings, this)
    }

    public async update(_time: number, delta: number): Promise<void> {
        this.gameEngine.update(delta)
        if (this.gameEngine.isGameOver()) {
            if (this.gameSettings.humanSettings.enabled) {
                await sleep(2000)
            }
            this.scene.start('EvaluationScene', this.gameEngine.getResults())
        }
    }

    public abort() {
        this.gameEngine.destroy()
        this.gameEngine.abort()
        this.scene.start('EvaluationScene', this.gameEngine.getResults())
    }
}
