import { BirdSoul } from '../actors/BirdSoul'

export type RoundResult = {
    aborted: boolean
    birdResults: {
        bird: BirdSoul
        timeAlive: number
    }[]
}
