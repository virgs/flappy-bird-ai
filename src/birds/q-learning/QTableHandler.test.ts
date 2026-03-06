import { beforeEach, describe, expect, it, vi } from 'vitest'

// Mock Phaser to avoid WebGL/Canvas requirements in test environment
vi.mock('phaser', () => ({
    Geom: {
        Point: class Point {
            public x: number
            public y: number
            constructor(x: number, y: number) {
                this.x = x
                this.y = y
            }
        },
    },
}))

// Mock GameConstants to avoid ?url asset imports
vi.mock('../../game/GameConstants', () => ({
    gameConstants: {
        gameDimensions: { width: 1024, height: 768 },
        birdAttributes: { flapImpulse: 0.75, maxBirdVerticalSpeed: 0.75 },
    },
}))

import { Actions, QTableHandler } from './QTableHandler'
import { QLearningSettings } from './QLearningSettings'

const makeSettings = (overrides: Partial<QLearningSettings> = {}): QLearningSettings =>
    ({
        learningRate: { min: 0, max: 1, value: 0.9, step: 0.01 },
        discountFactor: { min: 0, max: 1, value: 0.95, step: 0.01 },
        explorationRate: { min: 0, max: 1, value: 1, step: 0.01 },
        explorationRateDecay: { min: 0, max: 1, value: 0.005, step: 0.001 },
        gridSpatialAbstraction: {
            horizontal: { min: 5, max: 256, value: 25, step: 1 },
            vertical: { min: 5, max: 192, value: 20, step: 1 },
        },
        verticalVelocityDiscretization: { min: 1, max: 10, value: 3, step: 1 },
        ...overrides,
    }) as unknown as QLearningSettings

const makeUpdateData = (overrides = {}): Parameters<QTableHandler['getState']>[0] => ({
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

describe('QTableHandler.getStateHash', () => {
    it('produces a deterministic string for the same state', () => {
        const handler = new QTableHandler(makeSettings())
        const state = handler.getState(makeUpdateData())
        const hash1 = handler.getStateHash(state)
        const hash2 = handler.getStateHash(state)
        expect(hash1).toBe(hash2)
        expect(typeof hash1).toBe('string')
    })

    it('produces different hashes for different altitudes', () => {
        const handler = new QTableHandler(makeSettings())
        const stateA = handler.getState(makeUpdateData({ position: { x: 100, y: 100 } }))
        const stateB = handler.getState(makeUpdateData({ position: { x: 100, y: 600 } }))
        expect(handler.getStateHash(stateA)).not.toBe(handler.getStateHash(stateB))
    })

    it('auto-initialises a Q-tuple entry on first access', () => {
        const handler = new QTableHandler(makeSettings())
        const state = handler.getState(makeUpdateData())
        const hash = handler.getStateHash(state)

        expect(handler.table[hash]).toBeDefined()
        expect(handler.table[hash].visits).toBe(0)
        expect(handler.table[hash].actions[Actions.FLAP]).toBe(0)
        expect(handler.table[hash].actions[Actions.DO_NOT_FLAP]).toBe(0)
    })
})

describe('QTableHandler.getQTuple', () => {
    it('returns the Q-tuple for a known state', () => {
        const handler = new QTableHandler(makeSettings())
        const state = handler.getState(makeUpdateData())
        const tuple = handler.getQTuple(state)
        expect(tuple).toBeDefined()
        expect(tuple.actions).toHaveProperty(Actions.FLAP)
        expect(tuple.actions).toHaveProperty(Actions.DO_NOT_FLAP)
    })
})

describe('QTableHandler.updateQValue', () => {
    it('updates the Q-value for the given action', () => {
        const handler = new QTableHandler(makeSettings())
        const currentState = handler.getState(makeUpdateData())
        const nextState = handler.getState(makeUpdateData({ position: { x: 100, y: 250 } }))

        handler.updateQValue({
            currentState,
            nextState,
            reward: 100,
            action: Actions.FLAP,
        })

        const updated = handler.getQTuple(currentState).actions[Actions.FLAP]
        // Q[s,a] = 0 + 0.9 * (100 + 0.95*0 - 0) = 90
        expect(updated).toBeCloseTo(90)
    })

    it('does not affect the DO_NOT_FLAP value when only FLAP is updated', () => {
        const handler = new QTableHandler(makeSettings())
        const currentState = handler.getState(makeUpdateData())
        const nextState = handler.getState(makeUpdateData({ position: { x: 100, y: 250 } }))

        handler.updateQValue({ currentState, nextState, reward: 50, action: Actions.FLAP })

        expect(handler.getQTuple(currentState).actions[Actions.DO_NOT_FLAP]).toBe(0)
    })
})

describe('QTableHandler.getState', () => {
    it('returns alive flag from update data', () => {
        const handler = new QTableHandler(makeSettings())
        const state = handler.getState(makeUpdateData({ alive: false }))
        expect(state.alive).toBe(false)
    })

    it('returns undefined closestObstacleGapPosition when no obstacle data', () => {
        const handler = new QTableHandler(makeSettings())
        const state = handler.getState(makeUpdateData({ closestObstacleGapPosition: undefined }))
        expect(state.closestObstacleGapPosition).toBeUndefined()
    })
})
