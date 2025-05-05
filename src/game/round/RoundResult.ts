import { GameSettings } from '../../settings/GameSettings'
import { Bird } from '../actors/Birds'

export type RoundResult = {
    gameSettings: GameSettings
    aborted: boolean
    birdResults: {
        bird: Bird
        timeAlive: number
    }[]
}
