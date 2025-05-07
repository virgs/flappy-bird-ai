export interface Chromosome {
    genes: number[]
}

export type GeneticAlgorithmOptions = {
    mutationRate: number
    population: number
    elitismRatio: number
    crossoversCuts: number
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
        const elit = sortedResults.filter((_, index) => index < this.options.elitismRatio)
        const outcome = elit.map(citizen => citizen.chromosome)
        while (outcome.length < this.options.population) {
            outcome.push(this.createNewCitizen(sortedResults))
        }

        return outcome
    }

    private createNewCitizen(generation: CitizenResult[]): Chromosome {
        const firstParent = this.pickOne(generation)
        const secondParent = this.pickOne(generation)

        // Generate multiple crossover cut indices
        const geneLength = firstParent.chromosome.genes.length
        const crossoverCuts = Array.from({ length: this.options.crossoversCuts }, () =>
            Math.floor(Math.random() * geneLength)
        ).sort((a, b) => a - b) // Sort the cuts in ascending order

        const genes = firstParent.chromosome.genes.map((_, index) => {
            // Determine which parent to take the gene from based on crossover cuts
            const isFromSecondParent = crossoverCuts.filter(cut => index >= cut).length % 2 !== 0
            let geneValue = isFromSecondParent
                ? secondParent.chromosome.genes[index]
                : firstParent.chromosome.genes[index]

            // Apply mutation
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
