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
    [Key in BirdTypes]: number
}

export class RoundHandler {
    private readonly roundInitializers: RoundBirdInitializer[]

    public constructor(gameSettings: GameSettings) {
        this.roundInitializers = [
            new QLearningBirdsRoundInitializer(gameSettings.qLearningSettings),
            new HumanBirdsRoundInitializer(gameSettings.humanSettings),
        ]
    }

    public createFirstRoundSettings(): RoundSettings {
        const birds = this.roundInitializers.reduce((acc, initializer) => {
            return acc.concat(initializer.createFirstRoundSettings())
        }, [] as BirdSoul[])

        return {
            birdSouls: birds,
        }
    }

    public createSubsequentRoundsSettings(roundResult: RoundResult): RoundSettings {
        const roundBestResults = roundResult.birdResults.reduce((acc, result) => {
            const birdType = result.bird.props.type
            acc[birdType] ??= Math.max(acc[birdType] ?? 0, result.timeAlive)
            return acc
        }, {} as RoundBestResults)
        EventBus.emit('emit-round-best-results', roundBestResults)

        const birds = this.roundInitializers.reduce((acc, initializer) => {
            return acc.concat(initializer.createSubsequentRoundsSettings(roundResult))
        }, [] as BirdSoul[])

        return {
            birdSouls: birds,
        }
    }
}
