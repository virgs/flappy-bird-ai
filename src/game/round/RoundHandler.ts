import { HumanBirdsRoundInitializer } from '../../birds/human/HumanBirdsRoundInitializer'
import { GeneticAlgorithmBirdsRoundInitializer } from '../../birds/neuro-evolutionary/GeneticAlgorithmBirdsRoundInitializer'
import { QLearningBirdsRoundInitializer } from '../../birds/q-learning/QLearningBirdsRoundInitializer'
import { SimulatedAnnealingBirdsRoundInitializer } from '../../birds/simmulated-annealing/SimulatedAnnealingBirdsRoundInitializer'
import { BirdTypes } from '../../settings/BirdTypes'
import { GameSettings } from '../../settings/GameSettings'
import { BirdProps } from '../actors/BirdProps'
import { EventBus, GameEvents } from '../EventBus'
import { RoundBirdInitializer } from './RoundBirdInitializer'
import { RoundResult } from './RoundResult'
import { RoundSettings } from './RoundSettings'

export type RoundBirdTypeResult = Record<
    BirdTypes,
    {
        best: number
        sum: number
    }
>

export class RoundHandler {
    private readonly roundInitializers: RoundBirdInitializer[]
    private iterations: number

    public constructor(gameSettings: GameSettings) {
        this.roundInitializers = [
            new SimulatedAnnealingBirdsRoundInitializer(gameSettings.simulatedAnnealingSettings),
            new GeneticAlgorithmBirdsRoundInitializer(gameSettings.geneticAlgorithmSettings),
            new QLearningBirdsRoundInitializer(gameSettings.qLearningSettings),
            new HumanBirdsRoundInitializer(gameSettings.humanSettings),
        ]
        this.iterations = 0
    }

    public createFirstRoundSettings(): RoundSettings {
        const birds = this.roundInitializers.reduce((acc, initializer) => {
            return acc.concat(initializer.createFirstRoundSettings())
        }, [] as BirdProps[])

        return {
            iteration: ++this.iterations,
            birdSouls: birds,
        }
    }

    public createSubsequentRoundsSettings(roundResult: RoundResult): RoundSettings {
        const roundBirdTypeResult = roundResult.birdResults.reduce((acc, result) => {
            const birdType = result.bird.getFixture().type
            acc[birdType] =
                acc[birdType] !== undefined
                    ? {
                          best: Math.max(acc[birdType].best, result.pipesPassed),
                          sum: acc[birdType].sum + result.pipesPassed,
                      }
                    : { best: result.pipesPassed, sum: result.pipesPassed }
            return acc
        }, {} as RoundBirdTypeResult)
        EventBus.emit(GameEvents.ROUND_BEST_RESULTS, roundBirdTypeResult)

        const birds = this.roundInitializers.reduce((acc, initializer) => {
            return acc.concat(initializer.createSubsequentRoundsSettings(roundResult))
        }, [] as BirdProps[])

        return {
            iteration: ++this.iterations,
            birdSouls: birds,
        }
    }
}
