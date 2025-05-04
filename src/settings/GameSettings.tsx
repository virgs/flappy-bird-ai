import { BirdSettings, QTableSettings } from './BirdSettings'

export type GameSettings = {
    humanSettings: BirdSettings
    neuroEvolutionarySettings: BirdSettings
    simmulatedAnnealingSettings: BirdSettings
    qTableSettings: QTableSettings
}
