import { gameConstants } from '../../game/GameConstants'
import { BirdTypes } from '../../settings/BirdSettings'
import { GeneticAlgorithmSettings } from './GeneticAlgorithmSettings'

export const geneticAlgorithmDefaultSettings: GeneticAlgorithmSettings = {
    initialPositionHorizontalOffset: -25,
    label: 'Genetic Algorithm',
    cssColor: 'var(--bs-success)',
    birdType: BirdTypes.GENETIC_ALGORITHM,
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
        crossoversCuts: {
            min: 0,
            max: 3,
            value: 1,
            step: 1,
        },
        elitismRatio: {
            min: 0,
            max: 100,
            value: 5,
            step: 1,
        },
    },
}
