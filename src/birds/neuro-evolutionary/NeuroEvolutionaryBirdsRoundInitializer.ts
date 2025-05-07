import { Geom } from 'phaser'
import { BirdSoul } from '../../game/actors/BirdSoul'
import { gameConstants } from '../../game/GameConstants'
import { RoundBirdInitializer } from '../../game/round/RoundBirdInitializer'
import { RoundResult } from '../../game/round/RoundResult'
import { BirdTypes } from '../../settings/BirdSettings'
import { CitizenResult, GeneticAlgorithm } from './GeneticAlgorithm'
import { NeuroEvolutionaryBird, NeuroEvolutionayProps } from './NeuroEvolutionaryBird'
import { NeuralNetworkSettings, NeuroEvolutionarySettings } from './NeuroEvolutionarySettings'

export class NeuroEvolutionaryBirdsRoundInitializer implements RoundBirdInitializer {
    private readonly settings: NeuroEvolutionarySettings
    private readonly geneticAlgorithm: GeneticAlgorithm
    private readonly weightsAmount: number
    private readonly birdsInitialPosition = new Geom.Point(
        gameConstants.birdAttributes.initialPosition.x,
        gameConstants.birdAttributes.initialPosition.y
    )

    public constructor(settings: NeuroEvolutionarySettings) {
        this.settings = settings
        this.geneticAlgorithm = new GeneticAlgorithm({
            mutationRate: settings.geneticAlgorithm.mutationRate.value,
            crossovers: settings.geneticAlgorithm.crossovers.value,
            elitism: settings.geneticAlgorithm.elitism.value,
            population: settings.totalPopulation,
        })

        const ann = this.settings.artificialNeuralNetwork

        this.weightsAmount = this.computeWeightsAmount(ann)
    }

    private computeWeightsAmount(ann: NeuralNetworkSettings) {
        const layers = [
            ann.inputs,
            ...ann.hiddenLayers.map(hiddenLayer => ({ bias: hiddenLayer.bias, neurons: hiddenLayer.neurons.value })),
            { ...ann.outputs, bias: false }, // Outputs layer do not have bias
        ]
        return layers.reduce((totalWeights, layer, i) => {
            if (i === layers.length - 1) {
                return totalWeights // Skip last layer
            }
            const inputNeurons = layer.neurons + (layer.bias ? 1 : 0)
            const outputNeurons = layers[i + 1].neurons
            return totalWeights + inputNeurons * outputNeurons
        }, 0)
    }

    public createSubsequentRoundsSettings(roundResult: RoundResult): BirdSoul[] {
        const neuroEvolutionaryBirds: CitizenResult[] = roundResult.birdResults
            .filter(birdResult => birdResult.bird.getSoulProperties().type === BirdTypes.NEURO_EVOLUTIONARY)
            .map(birdResult => {
                const neuroEvolutionProps = birdResult.bird.getSoulProperties() as NeuroEvolutionayProps
                return {
                    chromosome: { genes: neuroEvolutionProps.annSettings.weights },
                    duration: birdResult.timeAlive,
                }
            })
        if (neuroEvolutionaryBirds.length > 0) {
            return this.geneticAlgorithm
                .createNextGeneration(neuroEvolutionaryBirds)
                .map(chromosome => this.createNeuroEvolutionaryBird(chromosome.genes))
        }
        return []
    }

    public createFirstRoundSettings(): BirdSoul[] {
        if (this.settings.enabled) {
            return Array.from({ length: this.settings.totalPopulation }).map(() => {
                const weights = Array.from(Array(this.weightsAmount)).map(() => Math.random() * 2 - 1)
                return this.createNeuroEvolutionaryBird(weights)
            })
        }
        return []
    }

    private createNeuroEvolutionaryBird(weights: number[]): BirdSoul {
        const position = new Geom.Point(
            this.birdsInitialPosition.x + this.settings.initialPositionHorizontalOffset + Math.random() * 10,
            this.birdsInitialPosition.y + Math.random() * gameConstants.gameDimensions.height * 0.5
        )
        const ann = this.settings.artificialNeuralNetwork
        return new NeuroEvolutionaryBird({
            type: BirdTypes.NEURO_EVOLUTIONARY,
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
