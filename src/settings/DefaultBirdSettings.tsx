import { gameConstants } from '../game/GameConstants'
import { BirdTypes } from './BirdSettings'
import { GameSettings } from './GameSettings'
import { qLearningDefaultSettings } from '../birds/q-learning/QLearningDefaultSettings'

export const defaultGameSettings: GameSettings = {
    humanSettings: {
        initialPositionHorizontalOffset: 0,
        totalPopulation: 1,
        birdType: BirdTypes.HUMAN,
        enabled: false,
        texture: gameConstants.spriteSheet.assets.birdYellow.name,
    },
    neuroEvolutionarySettings: {
        initialPositionHorizontalOffset: -5,
        totalPopulation: 100,
        birdType: BirdTypes.NEURO_EVOLUTIONARY,
        enabled: false,
        texture: gameConstants.spriteSheet.assets.birdGreen.name,
    },
    simmulatedAnnealingSettings: {
        initialPositionHorizontalOffset: -10,
        totalPopulation: 100,
        birdType: BirdTypes.SIMULATED_ANNEALING,
        enabled: false,
        texture: gameConstants.spriteSheet.assets.birdRed.name,
    },
    qLearningSettings: qLearningDefaultSettings,
}
