import { BirdProps } from '../actors/BirdProps'
import { RoundResult } from './RoundResult'

export interface RoundBirdInitializer {
    createFirstRoundSettings(): BirdProps[]
    createSubsequentRoundsSettings(roundResult: RoundResult): BirdProps[]
}
