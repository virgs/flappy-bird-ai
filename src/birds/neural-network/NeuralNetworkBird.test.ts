import { describe, expect, it, vi } from 'vitest'

vi.mock('../../game/GameConstants', () => ({
    gameConstants: {
        gameDimensions: { width: 1024, height: 768 },
        birdAttributes: { flapImpulse: 0.75, maxBirdVerticalSpeed: 0.75 },
    },
}))

import { NeuralNetworkBird } from './NeuralNetworkBird'
import { ArtificialNeuralNetworkInput } from './ArtificialNeuralNetwork'
import { BirdTypes } from '../../settings/BirdTypes'

// 4 inputs (no bias), no hidden layers, 1 output → 4 weights
const makeAnnSettings = (weights: number[]): ArtificialNeuralNetworkInput => ({
    inputs: { bias: false, neurons: 4 },
    hiddenLayers: [],
    outputs: { neurons: 1 },
    weights,
})

const makeFixture = () => ({
    type: BirdTypes.GENETIC_ALGORITHM,
    textureKey: 'bird',
    initialPosition: { x: 100, y: 200 } as unknown as Phaser.Geom.Point,
    annSettings: makeAnnSettings([0, 0, 0, 0]),
})

const makeUpdateData = (overrides = {}) => ({
    scene: {} as never,
    position: { x: 100, y: 200 },
    verticalSpeed: 0,
    roundIteration: 0,
    closestObstacleGapPosition: { x: 500, y: 300 },
    delta: 10,
    cooldownCounter: 0,
    alive: true,
    ...overrides,
})

describe('NeuralNetworkBird.getFixture', () => {
    it('returns the provided fixture', () => {
        const bird = new NeuralNetworkBird(makeFixture())
        expect(bird.getFixture().textureKey).toBe('bird')
        expect(bird.getFixture().type).toBe(BirdTypes.GENETIC_ALGORITHM)
    })
})

describe('NeuralNetworkBird.shouldFlap', () => {
    it('returns false before update is called', () => {
        const bird = new NeuralNetworkBird(makeFixture())
        expect(bird.shouldFlap()).toBe(false)
    })

    it('returns false with all-zero weights (sigmoid(0) = 0.5, not > 0.5)', () => {
        const bird = new NeuralNetworkBird(makeFixture())
        bird.update(makeUpdateData())
        expect(bird.shouldFlap()).toBe(false)
    })

    it('returns true with large positive weights', () => {
        const bird = new NeuralNetworkBird({
            ...makeFixture(),
            annSettings: makeAnnSettings([100, 100, 100, 100]),
        })
        bird.update(makeUpdateData())
        expect(bird.shouldFlap()).toBe(true)
    })

    it('returns false with large negative weights', () => {
        const bird = new NeuralNetworkBird({
            ...makeFixture(),
            annSettings: makeAnnSettings([-100, -100, -100, -100]),
        })
        bird.update(makeUpdateData())
        expect(bird.shouldFlap()).toBe(false)
    })

    it('uses last update data after multiple updates', () => {
        const bird = new NeuralNetworkBird({
            ...makeFixture(),
            annSettings: makeAnnSettings([100, 100, 100, 100]),
        })
        bird.update(makeUpdateData({ position: { x: 100, y: 200 } }))
        bird.update(makeUpdateData({ position: { x: 100, y: 200 } }))
        expect(bird.shouldFlap()).toBe(true)
    })

    it('defaults gap position to far-right center when no obstacle', () => {
        // With no obstacle, position defaults to {x: 1024, y: 384}
        // inputs[2] = (1024 - 100) / 1024 ≈ 0.9 (positive) → large positive weight → flap
        const bird = new NeuralNetworkBird({
            ...makeFixture(),
            annSettings: makeAnnSettings([0, 0, 100, 0]),
        })
        bird.update(makeUpdateData({ closestObstacleGapPosition: undefined }))
        expect(bird.shouldFlap()).toBe(true)
    })
})
