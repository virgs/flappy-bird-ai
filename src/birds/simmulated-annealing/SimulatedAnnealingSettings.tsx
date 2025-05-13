import { BirdSettings, Range } from '../../settings/BirdSettings'
import { BirdTypes } from '../../settings/BirdTypes'
import { NeuralNetworkSettings } from '../neural-network/NeuralNetworkSettings'

export type SimulatedAnnealingSettings = {
    birdType: BirdTypes.SIMULATED_ANNEALING
    artificialNeuralNetwork: NeuralNetworkSettings
    simulatedAnnealing: {
        initialTemperature: Range
        temperatureDecreaseRate: Range
        topCandidatesRatio: Range
        consecutiveSuccessesToCooldown: Range
        weightDisturbanceRatio: Range
    }
} & BirdSettings
