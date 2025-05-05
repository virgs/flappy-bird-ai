import { BirdSettings, QLearningSettings } from './BirdSettings'

export type GameSettings = {
    humanSettings: BirdSettings
    neuroEvolutionarySettings: BirdSettings
    simmulatedAnnealingSettings: BirdSettings
    qLearningSettings: QLearningSettings
}
