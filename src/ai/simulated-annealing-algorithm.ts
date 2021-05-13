import {Chromosome} from '../actors/chromosome';
import {BirdAttributes} from '../actors/birds/bird-attributes';

type ResultType = { attributes: BirdAttributes; duration: number; data: any; id: number };

export class SimulatedAnnealingAlgorithm {
    private readonly maxNumberOfIterations: number = 10;
    private readonly maxSuccessPerIteration: number = 2;
    private readonly temperatureReducer: number = 0.5;

    private temperature: number = .75;
    private lastResult: ResultType = null;
    private successCounter: number = 0;
    private iterationCounter: number = 0;
    private population: number = 100;

    public createNextGeneration(results: ResultType[]): Chromosome[] {
        const bestResult = results.sort((a, b) => b.duration - a.duration)[0];
        if (!this.lastResult) {
            return this.disturbChromosome(bestResult);
        }
        ++this.iterationCounter;
        if (this.iterationCounter > this.maxNumberOfIterations) {
            this.resetIteration();
        }
        const deltaResult = bestResult.duration - this.lastResult.duration;
        if (deltaResult > 0) {
            console.log('YAY');
            ++this.successCounter;
            if (this.successCounter > this.maxSuccessPerIteration) {
                this.resetIteration();
            }

            return this.disturbChromosome(bestResult);
        }
        return this.disturbChromosome(this.lastResult);
    }

    private disturbChromosome(result: ResultType): Chromosome[] {
        this.lastResult = result;
        return Array.from(Array(this.population))
            .map(() => {
                const indexToMutate = Math.floor(Math.random() * result.data.genes.length);
                const newGenes = result.data.genes
                    .map((gene, index) => {
                        if (index === indexToMutate) {
                            return this.mutateGene(gene);
                        }
                        return gene;
                    });
                return {
                    genes: newGenes
                };
            });
    }

    private mutateGene(gene: number): number {
        const mutation = Math.random() * 4 - 2;
        return Math.tanh(gene + mutation * this.temperature);
    }

    private resetIteration() {
        this.temperature *= this.temperatureReducer;
        this.successCounter = 0;
        this.iterationCounter = 0;
    }
}
