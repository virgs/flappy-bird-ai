import {Chromosome} from '../actors/chromosome';

export class GeneticAlgorithm {
    private readonly mutationRate: number;
    private readonly populationPerGeneration: number;
    private readonly selectedPopulationPerGeneration: number;

    constructor(mutationRate: number, populationPerGeneration: number, selectedPopulationPerGeneration: number) {
        this.mutationRate = mutationRate;
        this.populationPerGeneration = populationPerGeneration;
        this.selectedPopulationPerGeneration = selectedPopulationPerGeneration;
    }

    public createNextGeneration(oldGenerationResults: { chromosome: Chromosome, duration: number }[]): Chromosome[] {
        const bestCitizens = oldGenerationResults
            .filter((_, index) => index > oldGenerationResults.length - this.selectedPopulationPerGeneration - 1);
        return Array.from(Array(this.populationPerGeneration))
            .map(() => this.generateNewPopulationFromBestCitizens(bestCitizens));
    }

    private generateNewPopulationFromBestCitizens(bestCitizens: { chromosome: Chromosome; duration: number }[]): Chromosome {
        const firstParentIndex = Math.floor(Math.random() * bestCitizens.length);
        const secondParentIndex = Math.floor(Math.random() * bestCitizens.length);
        const firstParent = bestCitizens[firstParentIndex];
        const secondParent = bestCitizens[secondParentIndex];
        const genes = firstParent.chromosome.genes
            .map((_, index) => {
                let geneValue = firstParent.chromosome.genes[index];
                if (Math.random() > 0.5) {
                    geneValue = secondParent.chromosome.genes[index];
                }
                if (Math.random() < this.mutationRate) {
                    geneValue = Math.random();
                }
                return geneValue;
            });
        return {genes};
    }
}
