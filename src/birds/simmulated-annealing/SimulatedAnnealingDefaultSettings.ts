import { gameConstants } from '../../game/GameConstants'
import { BirdTypes } from '../../settings/BirdTypes'
import { SimulatedAnnealingSettings } from './SimulatedAnnealingSettings'

export const simulatedAnnealingDefaultSettings: SimulatedAnnealingSettings = {
    label: 'Simulated Annealing',
    cssColor: 'var(--bs-danger)',
    birdType: BirdTypes.SIMULATED_ANNEALING,
    enabled: false,
    texture: gameConstants.spriteSheet.assets.birdRed.name,
    totalPopulation: {
        min: 10,
        max: 100,
        value: 50,
        step: 1,
    },
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
            step: 0.005,
        },
        topCandidatesRatio: {
            min: 0,
            max: 1,
            value: 0.2,
            step: 0.01,
        },
        consecutiveSuccessesToCooldown: {
            min: 1,
            max: 50,
            value: 5,
            step: 1,
        },
        weightDisturbanceRatio: {
            min: 0,
            max: 1,
            value: 0.15,
            step: 0.01,
        },
    },
}
