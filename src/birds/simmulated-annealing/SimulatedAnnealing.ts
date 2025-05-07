export type SimulatedAnnealingProps = {
    population: number
    initialTemperature: number
    topCandidatesRatio: number
    temperatureDecreaseRate: number
    successToCooldown: number
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
            this.successCounter = 0
            this.temperature *= this.props.temperatureDecreaseRate
        }

        // Sort candidates by score in descending order
        const sortedResults = results.sort((a, b) => b.score - a.score)

        // Select the top candidates
        const topCandidates = sortedResults.slice(0, this.elitNumber)

        // Generate new candidates by disturbing the remaining candidates
        const newCandidates = Array.from(Array(this.props.population - topCandidates.length)).map(() =>
            this.disturbCandidate(sortedResults[Math.floor(Math.random() * sortedResults.length)])
        )

        // Return the new population (top candidates + disturbed candidates)
        return newCandidates.concat(topCandidates)
    }

    private disturbCandidate(candidate: Candidate): Candidate {
        const newWeights = candidate.weights.map(weight => {
            // Disturb the weight based on the current temperature
            if (Math.random() < this.temperature) {
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
}
