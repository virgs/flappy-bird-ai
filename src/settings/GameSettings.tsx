import { BirdSettings, HumanSettings } from './BirdSettings'
import { QLearningSettings } from '../birds/q-learning/QLearningSettings'

export type GameSettings = {
    humanSettings: HumanSettings
    neuroEvolutionarySettings: BirdSettings
    simmulatedAnnealingSettings: BirdSettings
    qLearningSettings: QLearningSettings
}
