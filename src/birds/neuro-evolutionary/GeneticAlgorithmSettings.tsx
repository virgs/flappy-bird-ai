import { BirdSettings, BirdTypes, Range } from '../../settings/BirdSettings'
import { NeuralNetworkSettings } from '../neural-network/NeuralNetworkSettings'

export type GeneticAlgorithmSettings = {
    birdType: BirdTypes.GENETIC_ALGORITHM
    artificialNeuralNetwork: NeuralNetworkSettings
    geneticAlgorithm: {
        mutationRate: Range
        crossoversCuts: Range
        elitismRatio: Range
    }
} & BirdSettings
