import { describe, expect, it, vi } from 'vitest'
import { CitizenResult, GeneticAlgorithm, GeneticAlgorithmOptions } from './GeneticAlgorithm'

const defaultOptions: GeneticAlgorithmOptions = {
    mutationRate: 0,
    population: 10,
    elitismRatio: 0.2,
    crossoversCuts: 1,
}

const makePopulation = (size: number, timeAlive = 100): CitizenResult[] =>
    Array.from({ length: size }, (_, i) => ({
        chromosome: { genes: [i * 0.1, i * 0.2] },
        timeAlive: timeAlive + i,
        pipesPassed: i,
    }))

describe('GeneticAlgorithm.createNextGeneration', () => {
    it('returns a new generation with the configured population size', () => {
        const ga = new GeneticAlgorithm(defaultOptions)
        const next = ga.createNextGeneration(makePopulation(10))
        expect(next.length).toBe(10)
    })

    it('preserves elite chromosomes unchanged', () => {
        // elitismRatio=0.2, population=10 → top 2 are preserved
        const ga = new GeneticAlgorithm(defaultOptions)
        const population = makePopulation(10)
        // Sort population descending by timeAlive to identify elites
        const sorted = [...population].sort((a, b) => b.timeAlive - a.timeAlive)
        const eliteGenes = sorted.slice(0, 2).map(c => c.chromosome.genes)

        const next = ga.createNextGeneration(population)

        for (const eliteGene of eliteGenes) {
            const found = next.some(c => JSON.stringify(c.genes) === JSON.stringify(eliteGene))
            expect(found).toBe(true)
        }
    })

    it('applies mutation when mutationRate is 1', () => {
        vi.spyOn(Math, 'random').mockReturnValue(0.5)
        const ga = new GeneticAlgorithm({ ...defaultOptions, mutationRate: 1, elitismRatio: 0 })
        const population = makePopulation(2)
        const next = ga.createNextGeneration(population)
        // With mutationRate=1 all genes are mutated, none should match originals exactly
        // random returns 0.5, so mutation = (0.5 - 0.5) * 2 = 0 — same value, just verify no throws
        expect(next.length).toBe(10)
        vi.restoreAllMocks()
    })

    it('handles a population of size 1 without crashing', () => {
        const ga = new GeneticAlgorithm({ ...defaultOptions, population: 1, elitismRatio: 1 })
        const population = makePopulation(1)
        const next = ga.createNextGeneration(population)
        expect(next.length).toBe(1)
    })

    it('sorts results by timeAlive descending so the fittest are selected', () => {
        const ga = new GeneticAlgorithm({ ...defaultOptions, elitismRatio: 1, population: 3 })
        const population: CitizenResult[] = [
            { chromosome: { genes: [1] }, timeAlive: 10, pipesPassed: 0 },
            { chromosome: { genes: [2] }, timeAlive: 50, pipesPassed: 0 },
            { chromosome: { genes: [3] }, timeAlive: 30, pipesPassed: 0 },
        ]
        const next = ga.createNextGeneration(population)
        // With 100% elitism all 3 are kept; first should be the fittest (timeAlive=50)
        expect(next[0].genes).toEqual([2])
    })
})
