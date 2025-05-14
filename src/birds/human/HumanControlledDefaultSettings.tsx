import { gameConstants } from '../../game/GameConstants'
import { BirdTypes } from '../../settings/BirdTypes'

export const humanControlledDefaultSettings = {
    totalPopulation: {
        min: 1,
        max: 1,
        value: 1,
        step: 1,
    },
    label: 'Human',
    cssColor: 'var(--bs-warning)',
    birdType: BirdTypes.HUMAN,
    enabled: true,
    texture: gameConstants.spriteSheet.assets.birdYellow.name,
}
