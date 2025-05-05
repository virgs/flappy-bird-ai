import { Scene } from 'phaser'

import { GameSettings } from '../../settings/GameSettings'
import { EventBus } from '../EventBus'
import { RoundHandler } from '../round/RoundHandler'
import { RoundResult } from '../round/RoundResult'

export class EvaluationScene extends Scene {
    private roundInitializer: RoundHandler
    private iterations: number = 0

    public constructor() {
        super('EvaluationScene')
    }

    public async init(result: RoundResult) {
        // Result can never be undefined, therefore, there always be a result and result.aborted cand be undefined
        // hence the check for result.aborted === false
        if (result.aborted === false) {
            this.iterations++
            this.scene.start('RoundScene', this.roundInitializer.createSubsequentRoundsSettings(result))
        }
    }

    public create() {
        EventBus.emit('update-current-scene', this)
    }

    public async startGame(gameSettings: GameSettings) {
        this.iterations = 0
        this.roundInitializer = new RoundHandler(gameSettings)
        console.log('EvaluationScene startGame')
        this.scene.start('RoundScene', this.roundInitializer.createFirstRoundSettings())
    }
}
