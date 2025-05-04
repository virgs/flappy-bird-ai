import { Scene } from 'phaser'

import { GameSettings } from '../../settings/GameSettings'
import { sleep } from '../../time/sleep'
import { EventBus } from '../EventBus'
import { RoundResult } from './GameScene'

export class EvaluationScene extends Scene {
    private gameInitialSettings: GameSettings
    private iterations: number = 0

    public constructor() {
        super('EvaluationScene')
    }

    public async init(output: RoundResult) {
        if (this.gameInitialSettings && !output.aborted) {
            if (this.gameInitialSettings.humanSettings.enabled) {
                await sleep(2000)
            }
            //@ts-expect-error
            const qTable = this.gameInitialSettings.qTableSettings.qTable.qTable ?? {}
            console.log('Qtable states', this.iterations, Object.keys(qTable).length, qTable)
            this.iterations++
            this.scene.start('GameScene', this.gameInitialSettings)
        }
    }

    public create() {
        EventBus.emit('current-scene-ready', this)
    }

    public startGame(playersSettings: GameSettings) {
        console.log('EvaluationScene startGame', playersSettings)
        this.gameInitialSettings = playersSettings
        this.iterations = 0
        this.scene.start('GameScene', playersSettings)
    }
}
