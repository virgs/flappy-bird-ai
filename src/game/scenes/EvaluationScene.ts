import { Scene } from 'phaser'

import { BirdTypes } from '../../settings/BirdSettings'
import { GameSettings } from '../../settings/GameSettings'
import { sleep } from '../../time/sleep'
import { BirdQTable } from '../actors/BirdQTable'
import { EventBus } from '../EventBus'
import { RoundResult } from './GameScene'

export class EvaluationScene extends Scene {
    private iterations: number = 0

    public constructor() {
        super('EvaluationScene')
    }

    public async init(output: RoundResult) {
        if (output.aborted === false) {
            if (output.birdPerformances.some(performance => performance.bird.getType() === BirdTypes.HUMAN)) {
                await sleep(2000)
            }
            const gameSettings: GameSettings = { ...output.gameSettings }

            gameSettings.qTableSettings.birds = output.birdPerformances
                .filter(performance => performance.bird.getType() === BirdTypes.Q_TABLE)
                .map(performance => (performance.bird as BirdQTable).getQTableBirdSettings())

            gameSettings.qTableSettings.birds.forEach(bird =>
                console.log(Object.keys(bird.qTable ?? {}).length, bird.qTable)
            )
            this.iterations++
            console.log('Iterations', this.iterations)
            this.scene.start('GameScene', gameSettings)
        }
    }

    public create() {
        EventBus.emit('current-scene-ready', this)
    }

    public startGame(playersSettings: GameSettings) {
        this.iterations = 0
        console.log('EvaluationScene startGame', playersSettings)
        this.scene.start('GameScene', playersSettings)
    }
}
