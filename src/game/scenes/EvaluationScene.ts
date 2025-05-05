import { Scene } from 'phaser'

import { BirdTypes } from '../../settings/BirdSettings'
import { GameSettings } from '../../settings/GameSettings'
import { sleep } from '../../time/sleep'
import { BirdQTable } from '../actors/BirdQTable'
import { EventBus } from '../EventBus'
import { RoundResult } from '../round/RoundResult'

export class EvaluationScene extends Scene {
    private iterations: number = 0

    public constructor() {
        super('EvaluationScene')
    }

    public async init(output: RoundResult) {
        if (output.aborted === false) {
            if (output.birdResults.some(birdResult => birdResult.bird.getType() === BirdTypes.HUMAN)) {
                await sleep(2000)
            }
            const gameSettings: GameSettings = { ...output.gameSettings }

            gameSettings.qLearningSettings.birds = output.birdResults
                .filter(performance => performance.bird.getType() === BirdTypes.Q_TABLE)
                .map(performance => (performance.bird as BirdQTable).getQTableBirdSettings())

            gameSettings.qLearningSettings.birds.forEach(bird =>
                console.log(Object.keys(bird.qTable ?? {}).length, bird.qTable)
            )
            this.iterations++
            console.log('Iterations', this.iterations)
            this.scene.start('RoundScene', gameSettings)
        }
    }

    public create() {
        EventBus.emit('update-current-scene', this)
    }

    public startGame(playersSettings: GameSettings) {
        this.iterations = 0
        console.log('EvaluationScene startGame', playersSettings)
        this.scene.start('RoundScene', playersSettings)
    }
}
