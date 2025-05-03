import { constants } from '../game/Constants'

export type PlayerSettings = {
    enabled: boolean
    texture: string
}

export const defaultPlayersSettings: { [propname: string]: PlayerSettings } = {
    human: {
        enabled: true,
        texture: constants.spriteSheet.assets.birdYellow.name,
    },
    neuroEvolutionaty: {
        enabled: false,
        texture: constants.spriteSheet.assets.birdGreen.name,
    },
    simmulatedAnnealing: {
        enabled: false,
        texture: constants.spriteSheet.assets.birdRed.name,
    },
    qTable: {
        enabled: false,
        texture: constants.spriteSheet.assets.birdBlue.name,
    },
}
