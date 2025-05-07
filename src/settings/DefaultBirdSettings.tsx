import { humanControlledDefaultSettings } from '../birds/human/HumanControlledDefaultSettings'
import { neuroEvolutionaryDefaultSettings } from '../birds/neuro-evolutionary/NeuroEvolutionaryDefaultSettings'
import { qLearningDefaultSettings } from '../birds/q-learning/QLearningDefaultSettings'
import { simulatedAnnealingDefaultSettings } from '../birds/simmulated-annealing/SimulatedAnnealingDefaultSettings'
import { GameSettings } from './GameSettings'

export const defaultGameSettings: GameSettings = {
    humanSettings: humanControlledDefaultSettings,
    neuroEvolutionarySettings: neuroEvolutionaryDefaultSettings,
    simulatedAnnealingSettings: simulatedAnnealingDefaultSettings,
    qLearningSettings: qLearningDefaultSettings,
}
