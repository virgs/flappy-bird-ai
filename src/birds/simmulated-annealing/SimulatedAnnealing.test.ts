import { describe, expect, it } from 'vitest'
import { Candidate, SimulatedAnnealing, SimulatedAnnealingProps } from './SimulatedAnnealing'

const defaultProps: SimulatedAnnealingProps = {
    population: 10,
    initialTemperature: 1,
    topCandidatesRatio: 0.2,
    temperatureDecreaseRate: 0.9,
    successToCooldown: 3,
    weightDisturbanceRatio: 0.5,
    numberOfWeights: 4,
}

const makePopulation = (size: number, score = 10): Candidate[] =>
    Array.from({ length: size }, (_, i) => ({
        weights: [i * 0.1, i * 0.2, i * 0.3, i * 0.4],
        score: score + i,
    }))

describe('SimulatedAnnealing.iterate', () => {
    it('returns the same population size', () => {
        const sa = new SimulatedAnnealing(defaultProps)
        const next = sa.iterate(makePopulation(10))
        expect(next.length).toBe(10)
    })

    it('preserves the top candidates unchanged', () => {
        // topCandidatesRatio=0.2, population=10 → top 2 (ceil) preserved
        const sa = new SimulatedAnnealing(defaultProps)
        const population = makePopulation(10)
        const sorted = [...population].sort((a, b) => b.score - a.score)
        const topTwo = sorted.slice(0, 2)

        const next = sa.iterate(population)

        for (const top of topTwo) {
            const found = next.some(c => JSON.stringify(c.weights) === JSON.stringify(top.weights))
            expect(found).toBe(true)
        }
    })

    it('marks newly generated candidates with NaN score', () => {
        const sa = new SimulatedAnnealing(defaultProps)
        const next = sa.iterate(makePopulation(10))
        // elitNumber = ceil(10 * 0.2) = 2, so 8 disturbed candidates
        const newCandidates = next.filter(c => isNaN(c.score))
        expect(newCandidates.length).toBe(8)
    })

    it('reduces temperature after successToCooldown consecutive improvements', () => {
        const props: SimulatedAnnealingProps = {
            ...defaultProps,
            successToCooldown: 2,
            temperatureDecreaseRate: 0.5,
            initialTemperature: 2,
        }
        const sa = new SimulatedAnnealing(props)

        // Each call with improving average score counts as a success
        sa.iterate(makePopulation(10, 10))  // avg=14.5, success=1
        sa.iterate(makePopulation(10, 20))  // avg=24.5, success=2 → cooldown resets + cools
        // Trigger the 3rd call — temperature should have been reduced once already
        const next = sa.iterate(makePopulation(10, 5)) // avg=9.5 < 24.5, no improvement
        expect(next.length).toBe(10)
    })

    it('handles a population of size 1 without crashing', () => {
        const sa = new SimulatedAnnealing({ ...defaultProps, population: 1, topCandidatesRatio: 1 })
        const next = sa.iterate([{ weights: [1, 2, 3, 4], score: 5 }])
        expect(next.length).toBe(1)
    })
})
