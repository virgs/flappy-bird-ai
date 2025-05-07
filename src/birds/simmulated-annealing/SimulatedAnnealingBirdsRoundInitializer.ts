import { Geom } from 'phaser'
import { BirdSoul } from '../../game/actors/BirdSoul'
import { gameConstants } from '../../game/GameConstants'
import { RoundBirdInitializer } from '../../game/round/RoundBirdInitializer'
import { RoundResult } from '../../game/round/RoundResult'
import { BirdTypes } from '../../settings/BirdSettings'
import { ArtificialNeuralNetwork } from '../neural-network/ArtificialNeuralNetwork'
import { NeuralNetworkBird, NeuralNetworkBirdProps } from '../neural-network/NeuralNetworkBird'
import { Candidate, SimulatedAnnealing } from './SimulatedAnnealing'
import { SimulatedAnnealingSettings } from './SimulatedAnnealingSettings'

export class SimulatedAnnealingBirdsRoundInitializer implements RoundBirdInitializer {
    private readonly settings: SimulatedAnnealingSettings
    private readonly simulatedAnnealing: SimulatedAnnealing
    private readonly weightsAmount: number
    private readonly birdsInitialPosition = new Geom.Point(
        gameConstants.birdAttributes.initialPosition.x,
        gameConstants.birdAttributes.initialPosition.y
    )

    public constructor(settings: SimulatedAnnealingSettings) {
        this.settings = settings
        const ann = this.settings.artificialNeuralNetwork

        this.weightsAmount = ArtificialNeuralNetwork.calculateExpectedWeights({
            inputs: ann.inputs,
            hiddenLayers: ann.hiddenLayers.map(layer => ({
                ...layer,
                neurons: layer.neurons.value,
            })),
            outputs: ann.outputs,
        })
        this.simulatedAnnealing = new SimulatedAnnealing({
            population: settings.totalPopulation,
            initialTemperature: settings.simulatedAnnealing.initialTemperature.value,
            topCandidatesRatio: settings.simulatedAnnealing.topCandidatesRatio.value,
            temperatureDecreaseRate: settings.simulatedAnnealing.temperatureDecreaseRate.value,
            successToCooldown: settings.simulatedAnnealing.successToCooldown.value,
            numberOfWeights: this.weightsAmount,
        })
    }

    public createSubsequentRoundsSettings(roundResult: RoundResult): BirdSoul[] {
        const simulatedAnnealingBirds: Candidate[] = roundResult.birdResults
            .filter(birdResult => birdResult.bird.getSoulProperties().type === BirdTypes.SIMULATED_ANNEALING)
            .map(birdResult => {
                const propsEvolutionProps = birdResult.bird.getSoulProperties() as NeuralNetworkBirdProps
                return {
                    weights: propsEvolutionProps.annSettings.weights,
                    score: birdResult.timeAlive,
                }
            })
        if (simulatedAnnealingBirds.length > 0) {
            return this.simulatedAnnealing
                .iterate(simulatedAnnealingBirds)
                .map(candidate => this.createNeuralNetworkBird(candidate.weights))
        }
        return []
    }

    public createFirstRoundSettings(): BirdSoul[] {
        if (this.settings.enabled) {
            return Array.from({ length: this.settings.totalPopulation }).map(() => {
                const weights = Array.from(Array(this.weightsAmount)).map(() => Math.random() * 2 - 1)
                return this.createNeuralNetworkBird(weights)
            })
        }
        return []
    }

    private createNeuralNetworkBird(weights: number[]): BirdSoul {
        const position = new Geom.Point(
            this.birdsInitialPosition.x + this.settings.initialPositionHorizontalOffset + Math.random() * 10,
            this.birdsInitialPosition.y + Math.random() * gameConstants.gameDimensions.height * 0.5
        )
        const ann = this.settings.artificialNeuralNetwork
        return new NeuralNetworkBird({
            type: BirdTypes.SIMULATED_ANNEALING,
            textureKey: this.settings.texture,
            initialPosition: position,
            annSettings: {
                inputs: ann.inputs,
                hiddenLayers: ann.hiddenLayers.map(layer => ({
                    ...layer,
                    neurons: layer.neurons.value,
                })),
                outputs: ann.outputs,
                weights: weights,
            },
        })
    }
}
