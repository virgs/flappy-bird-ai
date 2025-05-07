import { Geom } from 'phaser'
import { BirdSoul } from '../../game/actors/BirdSoul'
import { gameConstants } from '../../game/GameConstants'
import { RoundBirdInitializer } from '../../game/round/RoundBirdInitializer'
import { RoundResult } from '../../game/round/RoundResult'
import { BirdTypes } from '../../settings/BirdSettings'
import { ArtificialNeuralNetwork } from '../neural-network/ArtificialNeuralNetwork'
import { NeuralNetworkBird, NeuralNetworkBirdProps } from '../neural-network/NeuralNetworkBird'
import { CitizenResult, GeneticAlgorithm } from './GeneticAlgorithm'
import { GeneticAlgorithmSettings } from './GeneticAlgorithmSettings'

export class GeneticAlgorithmBirdsRoundInitializer implements RoundBirdInitializer {
    private readonly settings: GeneticAlgorithmSettings
    private readonly geneticAlgorithm: GeneticAlgorithm
    private readonly weightsAmount: number
    private readonly birdsInitialPosition = new Geom.Point(
        gameConstants.birdAttributes.initialPosition.x,
        gameConstants.birdAttributes.initialPosition.y
    )

    public constructor(settings: GeneticAlgorithmSettings) {
        this.settings = settings
        this.geneticAlgorithm = new GeneticAlgorithm({
            mutationRate: settings.geneticAlgorithm.mutationRate.value,
            crossoversCuts: settings.geneticAlgorithm.crossoversCuts.value,
            elitismRatio: settings.geneticAlgorithm.elitismRatio.value,
            population: settings.totalPopulation.value,
        })

        const ann = this.settings.artificialNeuralNetwork

        this.weightsAmount = ArtificialNeuralNetwork.calculateExpectedWeights({
            inputs: ann.inputs,
            hiddenLayers: ann.hiddenLayers.map(layer => ({
                ...layer,
                neurons: layer.neurons.value,
            })),
            outputs: ann.outputs,
        })
    }

    public createSubsequentRoundsSettings(roundResult: RoundResult): BirdSoul[] {
        const neuroEvolutionaryBirds: CitizenResult[] = roundResult.birdResults
            .filter(birdResult => birdResult.bird.getSoulProperties().type === BirdTypes.GENETIC_ALGORITHM)
            .map(birdResult => {
                const neuroEvolutionProps = birdResult.bird.getSoulProperties() as NeuralNetworkBirdProps
                return {
                    chromosome: { genes: neuroEvolutionProps.annSettings.weights },
                    duration: birdResult.timeAlive,
                }
            })
        if (neuroEvolutionaryBirds.length > 0) {
            return this.geneticAlgorithm
                .createNextGeneration(neuroEvolutionaryBirds)
                .map(chromosome => this.createNeuralNetworkBird(chromosome.genes))
        }
        return []
    }

    public createFirstRoundSettings(): BirdSoul[] {
        if (this.settings.enabled) {
            return Array.from({ length: this.settings.totalPopulation.value }).map(() => {
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
            type: BirdTypes.GENETIC_ALGORITHM,
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
