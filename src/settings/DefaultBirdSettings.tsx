import { constants } from '../game/Constants';
import { GameSettings } from './GameSettings';


export const defaultBirdSettings: GameSettings = {
    human: {
        enabled: false,
        texture: constants.spriteSheet.assets.birdYellow.name,
        key: 'human',
    },
    neuroEvolutionaty: {
        enabled: false,
        texture: constants.spriteSheet.assets.birdGreen.name,
        key: 'neuroEvolutionaty',
    },
    simmulatedAnnealing: {
        enabled: false,
        texture: constants.spriteSheet.assets.birdRed.name,
        key: 'simmulatedAnnealing',
    },
    qTable: {
        enabled: true,
        texture: constants.spriteSheet.assets.birdBlue.name,
        key: 'qTable',
        learningRate: 0.35,
        discountFactor: 0.8,
        gridSpatialAbstraction: {
            horizontal: 20,
            vertical: constants.obstacles.verticalOffset.total * 2,
        },
        timeGridInMs: 200,
        reward: {
            die: -100000,
            stayAlive: 10
        }
    },
};
