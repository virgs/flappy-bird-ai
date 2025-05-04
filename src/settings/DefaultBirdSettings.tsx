import { gameConstants } from '../game/GameConstants'
import { BirdTypes } from './BirdSettings'
import { GameSettings } from './GameSettings'
import { qBirdDefaultSettings } from '../ai/q-table/QBirdDefaultSettings'

export const defaultBirdSettings: GameSettings = {
    humanSettings: {
        initialPositionHorizontalOffset: 0,
        birdType: BirdTypes.HUMAN,
        enabled: false,
        texture: gameConstants.spriteSheet.assets.birdYellow.name,
    },
    neuroEvolutionarySettings: {
        initialPositionHorizontalOffset: -10,
        birdType: BirdTypes.NEURO_EVOLUTIONARY,
        enabled: false,
        texture: gameConstants.spriteSheet.assets.birdGreen.name,
    },
    simmulatedAnnealingSettings: {
        initialPositionHorizontalOffset: -20,
        birdType: BirdTypes.SIMULATED_ANNEALING,
        enabled: false,
        texture: gameConstants.spriteSheet.assets.birdRed.name,
    },
    qTableSettings: qBirdDefaultSettings,
}
