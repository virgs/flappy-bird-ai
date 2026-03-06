import { describe, expect, it } from 'vitest'
import { ArtificialNeuralNetwork, ArtificialNeuralNetworkInput } from './ArtificialNeuralNetwork'

const makeNetwork = (overrides: Partial<ArtificialNeuralNetworkInput> = {}): ArtificialNeuralNetworkInput => ({
    inputs: { bias: false, neurons: 2 },
    hiddenLayers: [],
    outputs: { neurons: 1 },
    weights: [0, 0],
    ...overrides,
})

describe('ArtificialNeuralNetwork.calculateExpectedWeights', () => {
    it('computes weights for a simple 2-input → 1-output network without bias', () => {
        const config = makeNetwork()
        expect(ArtificialNeuralNetwork.calculateExpectedWeights(config)).toBe(2)
    })

    it('adds extra weight per layer when bias is enabled on the input layer', () => {
        const config = makeNetwork({ inputs: { bias: true, neurons: 2 } })
        // (2 inputs + 1 bias) × 1 output = 3
        expect(ArtificialNeuralNetwork.calculateExpectedWeights(config)).toBe(3)
    })

    it('accounts for a hidden layer without bias', () => {
        const config = makeNetwork({
            inputs: { bias: false, neurons: 2 },
            hiddenLayers: [{ bias: false, neurons: 3 }],
            outputs: { neurons: 1 },
        })
        // 2×3 (input→hidden) + 3×1 (hidden→output) = 9
        expect(ArtificialNeuralNetwork.calculateExpectedWeights(config)).toBe(9)
    })

    it('accounts for a hidden layer with bias', () => {
        const config = makeNetwork({
            inputs: { bias: false, neurons: 2 },
            hiddenLayers: [{ bias: true, neurons: 3 }],
            outputs: { neurons: 1 },
        })
        // 2×3 (input→hidden) + (3+1)×1 (hidden+bias→output) = 10
        expect(ArtificialNeuralNetwork.calculateExpectedWeights(config)).toBe(10)
    })

    it('returns 0 weights for a single-neuron input → single-output with 0 hidden layers (trivial)', () => {
        const config = makeNetwork({ inputs: { bias: false, neurons: 1 }, outputs: { neurons: 1 } })
        // 1×1 = 1
        expect(ArtificialNeuralNetwork.calculateExpectedWeights(config)).toBe(1)
    })
})

describe('ArtificialNeuralNetwork constructor', () => {
    it('constructs without error when weight count is correct', () => {
        expect(() => new ArtificialNeuralNetwork(makeNetwork())).not.toThrow()
    })

    it('throws when provided fewer weights than expected', () => {
        expect(() => new ArtificialNeuralNetwork(makeNetwork({ weights: [0] }))).toThrow(/Expected 2 weights/)
    })

    it('throws when provided more weights than expected', () => {
        expect(() => new ArtificialNeuralNetwork(makeNetwork({ weights: [0, 0, 0] }))).toThrow(/Expected 2 weights/)
    })
})

describe('ArtificialNeuralNetwork.getWeights', () => {
    it('returns the configured weights', () => {
        const ann = new ArtificialNeuralNetwork(makeNetwork({ weights: [0.5, -0.5] }))
        expect(ann.getWeights()).toEqual([0.5, -0.5])
    })
})

describe('ArtificialNeuralNetwork.process', () => {
    it('throws when input size does not match neuron count', () => {
        const ann = new ArtificialNeuralNetwork(makeNetwork())
        expect(() => ann.process([1])).toThrow(/Input size mismatch/)
    })

    it('returns values in range [0, 1] due to sigmoid activation', () => {
        const ann = new ArtificialNeuralNetwork(makeNetwork({ weights: [1, -1] }))
        const output = ann.process([1, 1])
        expect(output.length).toBe(1)
        expect(output[0]).toBeGreaterThan(0)
        expect(output[0]).toBeLessThan(1)
    })

    it('returns ~0.5 for zero-weighted network regardless of input', () => {
        const ann = new ArtificialNeuralNetwork(makeNetwork({ weights: [0, 0] }))
        const output = ann.process([5, -5])
        // sigmoid(0) === 0.5
        expect(output[0]).toBeCloseTo(0.5)
    })

    it('includes bias neuron when enabled on inputs', () => {
        // 2 inputs + 1 bias → 1 output: weights [0, 0, 0] → output 0.5
        const ann = new ArtificialNeuralNetwork({
            inputs: { bias: true, neurons: 2 },
            hiddenLayers: [],
            outputs: { neurons: 1 },
            weights: [0, 0, 0],
        })
        const output = ann.process([1, 1])
        expect(output[0]).toBeCloseTo(0.5)
    })

    it('processes correctly through a hidden layer', () => {
        // 2 inputs → 2 hidden → 1 output, all weights = 0
        const ann = new ArtificialNeuralNetwork({
            inputs: { bias: false, neurons: 2 },
            hiddenLayers: [{ bias: false, neurons: 2 }],
            outputs: { neurons: 1 },
            weights: [0, 0, 0, 0, 0, 0], // 2×2 + 2×1
        })
        const output = ann.process([1, 1])
        // sigmoid(sigmoid(0)+sigmoid(0)) should still be in (0,1)
        expect(output[0]).toBeGreaterThan(0)
        expect(output[0]).toBeLessThan(1)
    })
})
