import { gameConstants } from '../../game/GameConstants';
import { BirdTypes } from '../../settings/BirdSettings';


export const humanControlledDefaultSettings = {
    initialPositionHorizontalOffset: 0,
    totalPopulation: 1,
    label: 'Human',
    cssColor: 'var(--bs-warning)',
    birdType: BirdTypes.HUMAN,
    enabled: false,
    texture: gameConstants.spriteSheet.assets.birdYellow.name,
};
