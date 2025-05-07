import { NeuroEvolutionarySettings } from '../birds/neuro-evolutionary/NeuroEvolutionarySettings'
import { QLearningSettings } from '../birds/q-learning/QLearningSettings'
import { SimulatedAnnealingSettings } from '../birds/simmulated-annealing/SimulatedAnnealingSettings'
import { HumanSettings } from './BirdSettings'

export type GameSettings = {
    humanSettings: HumanSettings
    neuroEvolutionarySettings: NeuroEvolutionarySettings
    simulatedAnnealingSettings: SimulatedAnnealingSettings
    qLearningSettings: QLearningSettings
}
