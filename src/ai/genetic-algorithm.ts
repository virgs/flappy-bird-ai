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
            .map(() => this.createNewCitizen(bestCitizens));
    }

    private createNewCitizen(parents: { chromosome: Chromosome; duration: number }[]): Chromosome {
        const firstParentIndex = Math.floor(Math.random() * parents.length);
        const secondParentIndex = Math.floor(Math.random() * parents.length);
        const firstParent = parents[firstParentIndex];
        const secondParent = parents[secondParentIndex];
        const crossOverCutIndex = Math.floor(Math.random() * firstParent.chromosome.genes.length);
        const genes = firstParent.chromosome.genes
            .map((_, index) => {
                let geneValue = firstParent.chromosome.genes[index];
                if (index > crossOverCutIndex) {
                    geneValue = secondParent.chromosome.genes[index];
                }
                if (Math.random() < this.mutationRate) {
                    geneValue *= Math.random() * 2 - 1;
                }
                return geneValue;
            });
        return {genes};
    }
}
