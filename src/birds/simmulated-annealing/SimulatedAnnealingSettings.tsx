import { BirdSettings, BirdTypes, Range } from '../../settings/BirdSettings'
import { NeuralNetworkSettings } from '../neural-network/NeuralNetworkSettings'

export type SimulatedAnnealingSettings = {
    birdType: BirdTypes.SIMULATED_ANNEALING
    artificialNeuralNetwork: NeuralNetworkSettings
    simulatedAnnealing: {
        // restartThreshold: 4000,
        initialTemperature: Range
        temperatureDecreaseRate: Range
        topCandidatesRatio: Range
        straightSuccessesToCooldown: Range
    }
} & BirdSettings
