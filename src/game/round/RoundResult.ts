import { BirdProps } from '../actors/BirdProps'

export type RoundResult = {
    aborted: boolean
    birdResults: {
        id: string
        bird: BirdProps
        pipesPassed: number
        timeAlive: number
    }[]
}
