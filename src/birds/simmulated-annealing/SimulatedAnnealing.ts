export type SimulatedAnnealingProps = {
    population: number
    initialTemperature: number
    temperatureDecreaseRate: number
    maxSuccessPerIteration: number
    numberOfWeights: number
}
export type Candidate = {
    weights: number[]
    score: number
}

export class SimulatedAnnealing {
    private readonly props: SimulatedAnnealingProps
    private lastBestResult?: Candidate
    private temperature: number
    private successCounter: number

    public constructor(settings: SimulatedAnnealingProps) {
        this.props = settings
        this.successCounter = 0

        this.temperature = this.props.initialTemperature
    }

    public iterate(results: Candidate[]): Candidate[] {
        const bestResult = results.sort((a, b) => b.score - a.score)[0]
        if (!this.lastBestResult) {
            return Array.from(Array(this.props.population - 1))
                .map(() => this.disturbCandidate(bestResult))
                .concat(bestResult)
        }

        const deltaResult = bestResult.score - this.lastBestResult.score
        if (deltaResult > 0) {
            ++this.successCounter
            if (this.successCounter > this.props.maxSuccessPerIteration) {
                this.adjustTemperature()
            }

            this.lastBestResult = bestResult
            return Array.from(Array(this.props.population - 1))
                .map(() => this.disturbCandidate(bestResult))
                .concat(bestResult)
        }
        return Array.from(Array(this.props.population - 1))
            .map(() => this.disturbCandidate(this.lastBestResult!))
            .concat(this.lastBestResult!)
    }

    private disturbCandidate(candidate: Candidate): Candidate {
        const newWeights = candidate.weights.map((action, index, array) => {
            if (Math.random() < this.temperature) {
                return this.disturbWeight(array[index - 1])
            }
            return action
        })
        return {
            weights: newWeights,
            score: NaN,
        }
    }

    private disturbWeight(previousWeightIndex: number): number {
        let nextActionIndex
        let cancelsPreviousAction
        do {
            nextActionIndex = Math.floor(Math.random() * this.props.numberOfWeights)
            const indexesDifference = nextActionIndex - previousWeightIndex

            cancelsPreviousAction = nextActionIndex % 2 === 0 ? indexesDifference === 1 : indexesDifference === -1 // avoid cancelling consecutive actions such as FF' or R'R
        } while (cancelsPreviousAction)
        return nextActionIndex
    }

    private adjustTemperature() {
        this.temperature *= this.props.temperatureDecreaseRate
        this.successCounter = 0
    }
}
