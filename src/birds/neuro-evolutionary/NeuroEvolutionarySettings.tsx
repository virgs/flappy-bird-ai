import { BirdSettings, BirdTypes, Range } from '../../settings/BirdSettings';

export type NeuralNetworkSettings = {
    inputs: {
        bias: boolean;
        neurons: number;
    }
    hiddenLayers: {
        bias: boolean;
        neurons: Range;
        activationFunction: (x: number) => number
    }[];
    outputs: {
        neurons: number;
        activationFunction: (x: number) => number
    };
}

export type NeuroEvolutionarySettings = {
    birdType: BirdTypes.NEURO_EVOLUTIONARY;
    artificialNeuralNetwork: NeuralNetworkSettings
    geneticAlgorithm: {
        mutationRate: Range;
        crossovers: Range;
        elitism: Range;
    }
} & BirdSettings;
