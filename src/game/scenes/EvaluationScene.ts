import { Scene } from 'phaser'

import { GameSettings } from '../../settings/GameSettings'
import { sleep } from '../../time/sleep'
import { QTable } from '../actors/QTable'
import { EventBus } from '../EventBus'
import { GameSceneOutput } from './GameScene'

export class EvaluationScene extends Scene {
    private gameInitialSettings: GameSettings
    private iterations: number = 0

    public constructor() {
        super('EvaluationScene')
    }

    public async init(output: GameSceneOutput) {
        if (this.gameInitialSettings && !output.aborted) {
            if (this.gameInitialSettings.human.enabled) {
                await sleep(2000)
            }
            //@ts-expect-error
            const qTable = this.gameInitialSettings.qTable.qTable.qTable ?? {}
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
        if (this.gameInitialSettings.qTable.enabled) {
            playersSettings.qTable.qTable = new QTable(this.gameInitialSettings.qTable)
        }
        this.scene.start('GameScene', playersSettings)
    }
}
