import {Chromosome} from '../actors/chromosome';
import {UrlQueryHandler} from '../url-query-handler';

export function generateRandomWeight(): number {
    return (Math.random() * 500) - 100;
}

export class GeneticAlgorithm {
    private readonly mutationRate: number = new UrlQueryHandler().getParameterByName('mutationRate', 0.05);
    private readonly hiddenNeurons: number = 3;
    private readonly numberOfInputs: number = 4;
    private readonly populationPerGeneration: number = new UrlQueryHandler().getParameterByName('populationPerGeneration', 2000);
    private readonly selectedPopulationPerGeneration: number = new UrlQueryHandler().getParameterByName('selectedPopulationPerGeneration', 5);

    public randomlyGenerate(): Chromosome[] {
        console.log('randomly generated');
        return Array.from(Array(this.populationPerGeneration))
            .map(() => {
                return {genes: Array.from(Array(this.numberOfInputs * this.hiddenNeurons)).map(() => generateRandomWeight())};
            });
    }

    public createNextGeneration(oldGenerationResults: { chromosome: Chromosome, duration: number }[]): Chromosome[] {
        console.log('createNextGeneration');
        const bestCitizens = oldGenerationResults
            .filter((_, index) => index > oldGenerationResults.length - this.selectedPopulationPerGeneration - 1);
        const chromosomes = Array.from(Array(this.populationPerGeneration))
            .map(() => this.generateNewPopulationFromBestCitizens(bestCitizens));
        return chromosomes;
    }

    private generateNewPopulationFromBestCitizens(bestCitizens: { chromosome: Chromosome; duration: number }[]): Chromosome {
        const firstParentIndex = Math.floor(Math.random() * bestCitizens.length);
        const secondParentIndex = Math.floor(Math.random() * bestCitizens.length);
        const firstParent = bestCitizens[firstParentIndex];
        const secondParent = bestCitizens[secondParentIndex];
        const genes = Array.from(Array(this.numberOfInputs * this.hiddenNeurons))
            .map((_, index) => {
                let geneValue = firstParent.chromosome.genes[index];
                if (Math.random() > 0.5) {
                    geneValue = secondParent.chromosome.genes[index];
                }
                if (Math.random() < this.mutationRate) {
                    geneValue = generateRandomWeight();
                }
                return geneValue;
            });
        return {genes};
    }
}
