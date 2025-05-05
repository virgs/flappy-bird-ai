import { BirdSettings, HumanSettings, QLearningSettings } from './BirdSettings'

export type GameSettings = {
    humanSettings: HumanSettings
    neuroEvolutionarySettings: BirdSettings
    simmulatedAnnealingSettings: BirdSettings
    qLearningSettings: QLearningSettings
}
