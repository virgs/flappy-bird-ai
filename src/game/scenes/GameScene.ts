import { Scene } from 'phaser'

import { GameSettings } from '../../settings/GameSettings'
import { EventBus, GameEvents } from '../EventBus'
import { RoundHandler } from '../round/RoundHandler'
import { RoundResult } from '../round/RoundResult'

export class GameScene extends Scene {
    private roundInitializer: RoundHandler

    public constructor() {
        super('GameScene')
    }

    public async init(result: RoundResult) {
        // Result can never be undefined, therefore, there always be a result and result.aborted cand be undefined
        // hence the check for result.aborted === false
        if (result.aborted === false) {
            this.scene.start('RoundScene', this.roundInitializer.createSubsequentRoundsSettings(result))
        }
    }

    public create() {
        EventBus.emit(GameEvents.UPDATE_GAME_SCENE, this)
    }

    public async startGame(gameSettings: GameSettings) {
        this.roundInitializer = new RoundHandler(gameSettings)
        console.log('GameScene startGame')
        EventBus.emit(GameEvents.NEW_GAME_STARTED, gameSettings)
        this.scene.start('RoundScene', this.roundInitializer.createFirstRoundSettings())
    }
}
