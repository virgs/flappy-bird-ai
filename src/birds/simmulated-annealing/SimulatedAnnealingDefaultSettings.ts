import { gameConstants } from '../../game/GameConstants'
import { BirdTypes } from '../../settings/BirdSettings'
import { SimulatedAnnealingSettings } from './SimulatedAnnealingSettings'

export const simulatedAnnealingDefaultSettings: SimulatedAnnealingSettings = {
    initialPositionHorizontalOffset: -35,
    label: 'Simulated Annealing',
    cssColor: 'var(--bs-danger)',
    birdType: BirdTypes.SIMULATED_ANNEALING,
    enabled: true,
    texture: gameConstants.spriteSheet.assets.birdRed.name,
    totalPopulation: 100,
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
    simulatedAnnealing: {
        initialTemperature: {
            min: 0,
            max: 1,
            value: 0.5,
            step: 0.01,
        },
        temperatureDecreaseRate: {
            min: 0,
            max: 1,
            value: 0.975,
            step: 0.01,
        },
        topCandidatesRatio: {
            min: 0,
            max: 1,
            value: 0.2,
            step: 0.01,
        },
        successToCooldown: {
            min: 1,
            max: 100,
            value: 20,
            step: 1,
        },
    },
}
