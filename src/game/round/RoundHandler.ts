import { HumanBirdsRoundInitializer } from '../../birds/human/HumanBirdsRoundInitializer'
import { QLearningBirdsRoundInitializer } from '../../birds/q-learning/QLearningBirdsRoundInitializer'
import { GameSettings } from '../../settings/GameSettings'
import { BirdSoul } from '../actors/BirdSoul'
import { RoundBirdInitializer } from './RoundBirdInitializer'
import { RoundResult } from './RoundResult'
import { RoundSettings } from './RoundSettings'

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
        const birds = this.roundInitializers.reduce((acc, initializer) => {
            return acc.concat(initializer.createSubsequentRoundsSettings(roundResult))
        }, [] as BirdSoul[])

        return {
            birdSouls: birds,
        }
    }
}
