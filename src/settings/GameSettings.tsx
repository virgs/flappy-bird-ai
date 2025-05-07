import { NeuroEvolutionarySettings } from '../birds/neuro-evolutionary/NeuroEvolutionarySettings'
import { QLearningSettings } from '../birds/q-learning/QLearningSettings'
import { BirdSettings, HumanSettings } from './BirdSettings'

export type GameSettings = {
    humanSettings: HumanSettings
    neuroEvolutionarySettings: NeuroEvolutionarySettings
    simmulatedAnnealingSettings: BirdSettings
    qLearningSettings: QLearningSettings
}
