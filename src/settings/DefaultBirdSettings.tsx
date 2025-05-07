import { gameConstants } from '../game/GameConstants'
import { BirdTypes } from './BirdSettings'
import { GameSettings } from './GameSettings'
import { qLearningDefaultSettings } from '../birds/q-learning/QLearningDefaultSettings'
import { neuroEvolutionaryDefaultSettings } from '../birds/neuro-evolutionary/NeuroEvolutionaryDefaultSettings'

export const defaultGameSettings: GameSettings = {
    humanSettings: {
        initialPositionHorizontalOffset: 0,
        totalPopulation: 1,
        label: 'Human',
        cssColor: 'var(--bs-warning)',
        birdType: BirdTypes.HUMAN,
        enabled: false,
        texture: gameConstants.spriteSheet.assets.birdYellow.name,
    },
    neuroEvolutionarySettings: neuroEvolutionaryDefaultSettings,
    simmulatedAnnealingSettings: {
        initialPositionHorizontalOffset: -10,
        label: 'Simulated Annealing',
        cssColor: 'var(--bs-danger)',
        totalPopulation: 100,
        birdType: BirdTypes.SIMULATED_ANNEALING,
        enabled: false,
        texture: gameConstants.spriteSheet.assets.birdRed.name,
    },
    qLearningSettings: qLearningDefaultSettings,
}
