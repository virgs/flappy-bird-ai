import { BirdSoul } from '../actors/BirdSoul'
import { RoundResult } from './RoundResult'

export interface RoundBirdInitializer {
    createFirstRoundSettings(): BirdSoul[]
    createSubsequentRoundsSettings(roundResult: RoundResult): BirdSoul[]
}
