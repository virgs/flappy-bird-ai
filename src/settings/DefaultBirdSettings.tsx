import { humanControlledDefaultSettings } from '../birds/human/HumanControlledDefaultSettings'
import { geneticAlgorithmDefaultSettings } from '../birds/neuro-evolutionary/GeneticAlgorithmDefaultSettings'
import { qLearningDefaultSettings } from '../birds/q-learning/QLearningDefaultSettings'
import { simulatedAnnealingDefaultSettings } from '../birds/simmulated-annealing/SimulatedAnnealingDefaultSettings'
import { GameSettings } from './GameSettings'

export const defaultGameSettings: GameSettings = {
    humanSettings: humanControlledDefaultSettings,
    geneticAlgorithmSettings: geneticAlgorithmDefaultSettings,
    simulatedAnnealingSettings: simulatedAnnealingDefaultSettings,
    qLearningSettings: qLearningDefaultSettings,
}
