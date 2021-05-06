import {Chromosome} from '../actors/chromosome';
import {UrlQueryHandler} from '../url-query-handler';

export function generateRandomWeight(): number {
    return (Math.random() * 500) - 100;
}

const urlQueryHandler = new UrlQueryHandler();

export class GeneticAlgorithm {
    private readonly mutationRate: number = parseInt(urlQueryHandler.getParameterByName('mutationRate', 0.05));
    private readonly populationPerGeneration: number = parseInt(urlQueryHandler.getParameterByName('populationPerGeneration', 2000));
    private readonly selectedPopulationPerGeneration: number = parseInt(urlQueryHandler.getParameterByName('selectedPopulationPerGeneration', 5));
    private readonly hiddenNeurons: number = 3;
    private readonly numberOfInputs: number = 4;

    public randomlyGenerate(): Chromosome[] {
        return Array.from(Array(this.populationPerGeneration))
            .map(() => {
                return {genes: Array.from(Array(this.numberOfInputs * this.hiddenNeurons)).map(() => generateRandomWeight())};
            });
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
