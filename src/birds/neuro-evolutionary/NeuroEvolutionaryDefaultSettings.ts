import { gameConstants } from '../../game/GameConstants'
import { BirdTypes } from '../../settings/BirdSettings'
import { NeuroEvolutionarySettings } from './NeuroEvolutionarySettings'

export const neuroEvolutionaryDefaultSettings: NeuroEvolutionarySettings = {
    initialPositionHorizontalOffset: -25,
    label: 'Neuro Evolutionary',
    cssColor: 'var(--bs-success)',
    birdType: BirdTypes.NEURO_EVOLUTIONARY,
    enabled: true,
    totalPopulation: 100,
    texture: gameConstants.spriteSheet.assets.birdGreen.name,
    artificialNeuralNetwork: {
        inputs: {
            bias: true,
            neurons: 4,
        },
        hiddenLayers: [
            {
                bias: true,
                neurons: { min: 0, max: 10, value: 5, step: 1 },
                activationFunction: (x: number) => 1 / (1 + Math.exp(-x)),
            },
        ],
        outputs: {
            neurons: 1,
            activationFunction: (x: number) => 1 / (1 + Math.exp(-x)),
        },
    },
    geneticAlgorithm: {
        mutationRate: {
            min: 0,
            max: 1,
            value: 0.01,
            step: 0.01,
        },
        crossovers: {
            min: 0,
            max: 3,
            value: 1,
            step: 1,
        },
        elitism: {
            min: 0,
            max: 100,
            value: 1,
            step: 1,
        },
    },
}
