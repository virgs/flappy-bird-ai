import { arrayShuffler } from '../../math/array-shufller'

export type SimulatedAnnealingProps = {
    population: number
    initialTemperature: number
    topCandidatesRatio: number
    temperatureDecreaseRate: number
    successToCooldown: number
    weightDisturbanceRatio: number
    numberOfWeights: number
}

export type Candidate = {
    weights: number[]
    score: number
}

export class SimulatedAnnealing {
    private readonly props: SimulatedAnnealingProps
    private readonly elitNumber: number
    private temperature: number
    private successCounter: number
    private lastAverageScore?: number

    public constructor(settings: SimulatedAnnealingProps) {
        this.props = settings
        this.successCounter = 0

        this.temperature = this.props.initialTemperature
        this.elitNumber = Math.ceil(this.props.population * this.props.topCandidatesRatio)
    }

    public iterate(results: Candidate[]): Candidate[] {
        // Update the last average result to the current average
        const average = this.calculateAverageScore(results)
        if (!this.lastAverageScore || average > this.lastAverageScore) {
            this.lastAverageScore = average
            ++this.successCounter
        }

        // Adjust temperature if successCounter exceeds maxSuccessPerIteration
        if (this.successCounter > this.props.successToCooldown) {
            console.log('Success counter exceeded, cooling down temperature')
            this.successCounter = 0
            this.temperature *= this.props.temperatureDecreaseRate
        }

        // Sort candidates by score in descending order
        const sortedResults = results.sort((a, b) => b.score - a.score)

        // Select the top candidates
        const topCandidates = sortedResults.slice(0, this.elitNumber)

        // Generate new candidates by disturbing the remaining candidates
        const newCandidates = Array.from(Array(this.props.population - topCandidates.length)).map(() =>
            this.disturbCandidate(this.pickOne(sortedResults))
        )

        // Return the new population (top candidates + disturbed candidates)
        return newCandidates.concat(topCandidates)
    }

    private disturbCandidate(candidate: Candidate): Candidate {
        const weightIndexes: number[] = arrayShuffler(
            Array.from({ length: candidate.weights.length }, (_, index) => index)
        )
        // Select random indexes to disturb
        const disturbedWeightIndexes: number[] = weightIndexes.slice(
            0,
            Math.ceil(this.props.weightDisturbanceRatio * candidate.weights.length)
        )
        const newWeights = candidate.weights.map((weight, index) => {
            if (disturbedWeightIndexes.includes(index)) {
                // Disturb the selected weight based on the current temperature
                return this.disturbWeight(weight)
            }
            return weight
        })
        return {
            weights: newWeights,
            score: NaN, // Score will be recalculated later
        }
    }

    private disturbWeight(weight: number): number {
        // Add a random disturbance to the weight based on temperature
        const disturbance = (Math.random() * 2 - 1) * this.temperature // Random value between -temperature and +temperature
        return weight + disturbance
    }

    private calculateAverageScore(results: Candidate[]): number {
        // Calculate the average score of the population
        return results.reduce((sum, candidate) => sum + candidate.score, 0) / results.length
    }

    //Every bird is a candidate. The ones that have best fitness value (normalized) have more probability to be chosen

    // Uses a fitness-proportional selection (roulette wheel).
    // A valid approach, but it assumes that all duration values are positive.
    // If any duration is zero or negative, the method could fail or behave unexpectedly.
    // All durations values should be positive before calling
    private pickOne(generation: Candidate[]): Candidate {
        const totalFitness = generation.reduce((acc, bird) => acc + bird.score, 0)
        let index = 0
        let r = Math.random() * totalFitness
        while (r > 0) {
            r = r - generation[index].score
            index++
        }
        index--
        return generation[index]
    }
}
