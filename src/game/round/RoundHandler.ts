import { HumanBirdsRoundInitializer } from '../../birds/human/HumanBirdsRoundInitializer'
import { QLearningBirdsRoundInitializer } from '../../birds/q-learning/QLearningBirdsRoundInitializer'
import { BirdTypes } from '../../settings/BirdSettings'
import { GameSettings } from '../../settings/GameSettings'
import { BirdSoul } from '../actors/BirdSoul'
import { EventBus } from '../EventBus'
import { RoundBirdInitializer } from './RoundBirdInitializer'
import { RoundResult } from './RoundResult'
import { RoundSettings } from './RoundSettings'

export type RoundBestResults = {
    [Key in BirdTypes]: { best: number; avg: number; counter: number }
}

export class RoundHandler {
    private readonly roundInitializers: RoundBirdInitializer[]
    private iterations: number

    public constructor(gameSettings: GameSettings) {
        this.roundInitializers = [
            new QLearningBirdsRoundInitializer(gameSettings.qLearningSettings),
            new HumanBirdsRoundInitializer(gameSettings.humanSettings),
        ]
        this.iterations = 0
    }

    public createFirstRoundSettings(): RoundSettings {
        const birds = this.roundInitializers.reduce((acc, initializer) => {
            return acc.concat(initializer.createFirstRoundSettings())
        }, [] as BirdSoul[])

        return {
            iteration: ++this.iterations,
            birdSouls: birds,
        }
    }

    public createSubsequentRoundsSettings(roundResult: RoundResult): RoundSettings {
        const roundBestResults = roundResult.birdResults.reduce((acc, result) => {
            const birdType = result.bird.props.type
            acc[birdType] =
                acc[birdType] !== undefined
                    ? {
                          best: Math.max(acc[birdType].best, result.timeAlive),
                          avg: acc[birdType].avg + result.timeAlive,
                          counter: acc[birdType].counter + 1,
                      }
                    : { best: result.timeAlive, avg: result.timeAlive, counter: 1 }
            return acc
        }, {} as RoundBestResults)
        console.log(Object.keys(roundResult.birdResults[0].bird.qTableHandler.table).length)
        console.log(roundResult.birdResults[0].bird.qTableHandler.table)
        console.log('Round best results', JSON.stringify(roundBestResults))
        EventBus.emit('emit-round-best-results', roundBestResults)

        const birds = this.roundInitializers.reduce((acc, initializer) => {
            return acc.concat(initializer.createSubsequentRoundsSettings(roundResult))
        }, [] as BirdSoul[])

        return {
            iteration: ++this.iterations,
            birdSouls: birds,
        }
    }
}
