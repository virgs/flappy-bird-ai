import { GeneticAlgorithmSettings } from '../birds/neuro-evolutionary/GeneticAlgorithmSettings'
import { QLearningSettings } from '../birds/q-learning/QLearningSettings'
import { SimulatedAnnealingSettings } from '../birds/simmulated-annealing/SimulatedAnnealingSettings'
import { HumanSettings } from './BirdSettings'

export type GameSettings = {
    humanSettings: HumanSettings
    geneticAlgorithmSettings: GeneticAlgorithmSettings
    simulatedAnnealingSettings: SimulatedAnnealingSettings
    qLearningSettings: QLearningSettings
}
