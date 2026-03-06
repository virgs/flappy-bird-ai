import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

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

vi.mock('../../game/GameConstants', () => ({
    gameConstants: {
        gameDimensions: { width: 1024, height: 768 },
        birdAttributes: { flapImpulse: 0.75, maxBirdVerticalSpeed: 0.75 },
    },
}))

import { Actions, QTableHandler, State } from './QTableHandler'
import { QLearningBird, Rewards } from './QLearningBird'
import { QLearningSettings } from './QLearningSettings'
import { BirdTypes } from '../../settings/BirdTypes'

const STATE_A: State = { altitude: 0, verticalSpeed: 0, alive: true }
const STATE_B: State = { altitude: 1, verticalSpeed: 0, alive: true }

const makeSettings = (): QLearningSettings =>
    ({
        birdType: BirdTypes.Q_LEARNING,
        label: 'Test',
        cssColor: 'blue',
        texture: 'bird',
        enabled: true,
        totalPopulation: { min: 1, max: 1000, value: 10, step: 1 },
        learningRate: { min: 0, max: 1, value: 0.1, step: 0.01 },
        discountFactor: { min: 0, max: 1, value: 0.95, step: 0.01 },
        explorationRate: { min: 0, max: 1, value: 0, step: 0.01 },
        explorationRateDecay: { min: 0, max: 1, value: 0, step: 0.001 },
        gridSpatialAbstraction: {
            horizontal: { min: 5, max: 256, value: 10, step: 1 },
            vertical: { min: 5, max: 192, value: 10, step: 1 },
        },
        verticalVelocityDiscretization: { min: 1, max: 10, value: 3, step: 1 },
        rewards: {
            hitTopPipe: { min: -1000, max: 0, value: -1000, step: 5 },
            hitBottomPipe: { min: -1000, max: 0, value: -1000, step: 5 },
            hitFloor: { min: -1000, max: 0, value: -1000, step: 5 },
            hitCeiling: { min: -1000, max: 0, value: -1000, step: 5 },
            millisecondsAlive: { min: 0, max: 1, value: 0.003, step: 0.001 },
            passedPipe: { min: 0, max: 100, value: 100, step: 1 },
        },
    }) as unknown as QLearningSettings

const makeFixture = () => ({
    type: BirdTypes.Q_LEARNING,
    textureKey: 'bird',
    initialPosition: { x: 100, y: 200 } as unknown as Phaser.Geom.Point,
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

const makeQTableHandler = () => {
    let getStateCallIndex = 0
    const states = [STATE_A, STATE_B]
    return {
        getState: vi.fn(() => states[getStateCallIndex++ % states.length]),
        getStateHash: vi.fn((s: State) => `state-${s.altitude}`),
        getQTuple: vi.fn(() => ({
            actions: { [Actions.FLAP]: 0.8, [Actions.DO_NOT_FLAP]: 0 },
            visits: 1,
        })),
        table: {},
    } as unknown as QTableHandler
}

const makeBird = (qTableHandler = makeQTableHandler()) =>
    new QLearningBird({
        ...makeFixture(),
        settings: makeSettings(),
        episode: 0,
        rewards: makeSettings().rewards,
        qTableHandler,
    })

describe('QLearningBird.getFixture', () => {
    it('returns the provided props', () => {
        const bird = makeBird()
        const fixture = bird.getFixture()
        expect(fixture.type).toBe(BirdTypes.Q_LEARNING)
        expect(fixture.textureKey).toBe('bird')
    })
})

describe('QLearningBird.explorationRate', () => {
    it('clamps to 0.001 minimum', () => {
        const bird = new QLearningBird({
            ...makeFixture(),
            settings: makeSettings(),
            episode: 9999,
            rewards: makeSettings().rewards,
            qTableHandler: makeQTableHandler(),
        })
        // explorationRate = max(0.001, 0 - 0 * 9999) = 0.001 — bird still alive, Math.random always > 0.001
        vi.spyOn(Math, 'random').mockReturnValue(0.5)
        bird.update(makeUpdateData())
        expect(bird.shouldFlap()).toBe(true) // FLAP Q-value > DO_NOT_FLAP
    })

    it('decays based on episode number', () => {
        // With value=1.0 and decay=0.01, after episode 50: rate = max(0.001, 1.0 - 0.5) = 0.5
        const settings = {
            ...makeSettings(),
            explorationRate: { min: 0, max: 1, value: 1.0, step: 0.01 },
            explorationRateDecay: { min: 0, max: 1, value: 0.01, step: 0.001 },
        } as unknown as QLearningSettings
        const bird = new QLearningBird({
            ...makeFixture(),
            settings,
            episode: 50,
            rewards: settings.rewards,
            qTableHandler: makeQTableHandler(),
        })
        // explorationRate = max(0.001, 1.0 - 0.01*50) = 0.5
        // With Math.random() = 0.3 (< 0.5), explores randomly
        vi.spyOn(Math, 'random').mockReturnValue(0.3)
        bird.update(makeUpdateData())
        // In random branch: second Math.random() call: 0.3 < 0.5 → FLAP
        expect(bird.shouldFlap()).toBe(true)
    })
})

describe('QLearningBird.moves', () => {
    afterEach(() => vi.restoreAllMocks())

    it('starts empty', () => {
        expect(makeBird().moves).toHaveLength(0)
    })

    it('records no move on first shouldFlap (no previous decision)', () => {
        vi.spyOn(Math, 'random').mockReturnValue(0.5)
        const bird = makeBird()
        bird.update(makeUpdateData())
        bird.shouldFlap()
        expect(bird.moves).toHaveLength(0)
    })

    it('records a move on second shouldFlap with correct fields', () => {
        vi.spyOn(Math, 'random').mockReturnValue(0.5)
        const bird = makeBird()

        bird.update(makeUpdateData())
        bird.shouldFlap()
        bird.update(makeUpdateData())
        bird.shouldFlap()

        expect(bird.moves).toHaveLength(1)
        const move = bird.moves[0]
        expect(move.state).toBe('state-0')
        expect(move.nextState).toBe('state-1')
        expect(move.action).toBe(Actions.FLAP)
        expect(move.reward).toBe(Rewards.MILLISECONDS_ALIVE)
    })

    it('resets reward to MILLISECONDS_ALIVE after recording', () => {
        vi.spyOn(Math, 'random').mockReturnValue(0.5)
        const bird = makeBird()
        bird.update(makeUpdateData())
        bird.shouldFlap()
        bird.onPassedPipe()
        bird.update(makeUpdateData())
        bird.shouldFlap()

        expect(bird.moves[0].reward).toBe(Rewards.PASSED_PIPE)

        bird.update(makeUpdateData())
        bird.shouldFlap()
        expect(bird.moves[1].reward).toBe(Rewards.MILLISECONDS_ALIVE)
    })
})

describe('QLearningBird death recording', () => {
    afterEach(() => vi.restoreAllMocks())

    it('records death move in update() when death reward is set', () => {
        vi.spyOn(Math, 'random').mockReturnValue(0.5)
        const bird = makeBird()
        bird.update(makeUpdateData())
        bird.shouldFlap()

        bird.onHitFloor()
        bird.update(makeUpdateData())

        expect(bird.moves).toHaveLength(1)
        expect(bird.moves[0].reward).toBe(Rewards.HIT_FLOOR)
        expect(bird.moves[0].state).toBe('state-0')
        expect(bird.moves[0].nextState).toBe('state-1')
    })

    it('records no death move if there was no previous decision state', () => {
        const bird = makeBird()
        bird.onHitFloor()
        bird.update(makeUpdateData())
        expect(bird.moves).toHaveLength(0)
    })

    it('returns false from shouldFlap after death', () => {
        vi.spyOn(Math, 'random').mockReturnValue(0.5)
        const bird = makeBird()
        bird.update(makeUpdateData())
        bird.shouldFlap()
        bird.onHitFloor()
        bird.update(makeUpdateData())

        expect(bird.shouldFlap()).toBe(false)
    })
})

describe('QLearningBird reward setters', () => {
    it('onPassedPipe sets PASSED_PIPE reward', () => {
        vi.spyOn(Math, 'random').mockReturnValue(0.5)
        const bird = makeBird()
        bird.update(makeUpdateData())
        bird.shouldFlap()
        bird.onPassedPipe()
        bird.update(makeUpdateData())
        bird.shouldFlap()
        expect(bird.moves[0].reward).toBe(Rewards.PASSED_PIPE)
    })

    it('onHitCeiling sets HIT_CEILING reward', () => {
        vi.spyOn(Math, 'random').mockReturnValue(0.5)
        const bird = makeBird()
        bird.update(makeUpdateData())
        bird.shouldFlap()
        bird.onHitCeiling()
        bird.update(makeUpdateData())
        expect(bird.moves[0].reward).toBe(Rewards.HIT_CEILING)
    })

    it('onHitTopPipeObstacle sets HIT_TOP_PIPE reward', () => {
        vi.spyOn(Math, 'random').mockReturnValue(0.5)
        const bird = makeBird()
        bird.update(makeUpdateData())
        bird.shouldFlap()
        bird.onHitTopPipeObstacle()
        bird.update(makeUpdateData())
        expect(bird.moves[0].reward).toBe(Rewards.HIT_TOP_PIPE)
    })

    it('onHitBottomPipeObstacle sets HIT_BOTTOM_PIPE reward', () => {
        vi.spyOn(Math, 'random').mockReturnValue(0.5)
        const bird = makeBird()
        bird.update(makeUpdateData())
        bird.shouldFlap()
        bird.onHitBottomPipeObstacle()
        bird.update(makeUpdateData())
        expect(bird.moves[0].reward).toBe(Rewards.HIT_BOTTOM_PIPE)
    })
})
