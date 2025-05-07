export interface Chromosome {
    genes: number[]
}

export type GeneticAlgorithmOptions = {
    mutationRate: number
    population: number
    elitism: number
    crossovers: number
}

export type CitizenResult = {
    chromosome: Chromosome
    duration: number
}

export class GeneticAlgorithm {
    private readonly options: GeneticAlgorithmOptions

    constructor(options: GeneticAlgorithmOptions) {
        this.options = options
    }

    public createNextGeneration(oldGenerationResults: CitizenResult[]): Chromosome[] {
        // Sort the results by duration (fitness) in descending order
        const sortedResults = [...oldGenerationResults].sort((a, b) => b.duration - a.duration)
        const elit = sortedResults.filter((_, index) => index < this.options.elitism)
        const outcome = elit.map(citizen => citizen.chromosome)
        while (outcome.length < this.options.population) {
            outcome.push(this.createNewCitizen(sortedResults))
        }

        return outcome
    }

    private createNewCitizen(generation: CitizenResult[]): Chromosome {
        const firstParent = this.pickOne(generation)
        const secondParent = this.pickOne(generation)
        const crossOverCutIndex = Math.floor(Math.random() * firstParent.chromosome.genes.length)
        const genes = firstParent.chromosome.genes.map((_, index) => {
            let geneValue = firstParent.chromosome.genes[index]
            if (index > crossOverCutIndex) {
                geneValue = secondParent.chromosome.genes[index]
            }
            if (Math.random() < this.options.mutationRate) {
                geneValue += (Math.random() - 0.5) * 2 // Small random adjustment
            }
            return geneValue
        })
        return { genes }
    }

    //Every bird is a candidate. The ones that have best fitness value (normalized) have more probability to be chosen

    // Uses a fitness-proportional selection (roulette wheel).
    // A valid approach, but it assumes that all duration values are positive.
    // If any duration is zero or negative, the method could fail or behave unexpectedly.
    // Fix: Ensure all duration values are normalized to be positive before calling
    private pickOne(generation: CitizenResult[]): CitizenResult {
        const totalFitness = generation.reduce((acc, bird) => acc + bird.duration, 0)
        let index = 0
        let r = Math.random() * totalFitness
        while (r > 0) {
            r = r - generation[index].duration
            index++
        }
        index--
        return generation[index]
    }
}
