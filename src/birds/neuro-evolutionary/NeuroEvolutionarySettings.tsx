import { BirdSettings, BirdTypes, Range } from '../../settings/BirdSettings';
import { NeuralNetworkSettings } from '../neural-network/NeuralNetworkSettings';

export type NeuroEvolutionarySettings = {
    birdType: BirdTypes.NEURO_EVOLUTIONARY;
    artificialNeuralNetwork: NeuralNetworkSettings
    geneticAlgorithm: {
        mutationRate: Range;
        crossovers: Range;
        elitism: Range;
    }
} & BirdSettings;
