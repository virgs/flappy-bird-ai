import { gameConstants } from '../../game/GameConstants'
import { BirdTypes } from '../../settings/BirdSettings'
import { NeuroEvolutionarySettings } from './NeuroEvolutionarySettings'

export const neuroEvolutionaryDefaultSettings: NeuroEvolutionarySettings = {
    initialPositionHorizontalOffset: -25,
    label: 'Neuro Evolutionary',
    cssColor: 'var(--bs-success)',
    birdType: BirdTypes.NEURO_EVOLUTIONARY,
    enabled: false,
    totalPopulation: {
        min: 1,
        max: 100,
        value: 50,
        step: 1,
    },
    texture: gameConstants.spriteSheet.assets.birdGreen.name,
    artificialNeuralNetwork: {
        inputs: {
            bias: true,
            neurons: 4,
        },
        hiddenLayers: [
            {
                bias: true,
                neurons: { min: 1, max: 10, value: 5, step: 1 },
            },
        ],
        outputs: {
            neurons: 1,
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
