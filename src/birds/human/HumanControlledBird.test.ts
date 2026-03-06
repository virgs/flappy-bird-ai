import { afterEach, describe, expect, it, vi } from 'vitest'

vi.mock('phaser', () => {
    class EventEmitter {
        private readonly listeners: Map<string, ((...args: unknown[]) => void)[]> = new Map()

        on(event: string, fn: (...args: unknown[]) => void): void {
            if (!this.listeners.has(event)) {
                this.listeners.set(event, [])
            }
            this.listeners.get(event)!.push(fn)
        }

        emit(event: string, ...args: unknown[]): void {
            this.listeners.get(event)?.forEach(fn => fn(...args))
        }

        removeListener(event: string): void {
            this.listeners.delete(event)
        }
    }

    return {
        Events: { EventEmitter },
        Input: {
            Keyboard: {
                KeyCodes: { SPACE: 32 },
                Key: class Key {
                    public isDown = false
                },
            },
        },
    }
})

import { HumanControlledBird } from './HumanControlledBird'
import { EventBus, GameEvents } from '../../game/EventBus'
import { BirdTypes } from '../../settings/BirdTypes'

const makeFixture = () => ({
    type: BirdTypes.HUMAN,
    textureKey: 'bird',
    initialPosition: { x: 100, y: 200 } as unknown as Phaser.Geom.Point,
})

const makeUpdateData = (keyboardOverride?: { addKey: () => { isDown: boolean } }) => ({
    scene: {
        input: {
            keyboard: {
                addKey: keyboardOverride?.addKey ?? vi.fn(() => ({ isDown: false })),
            },
        },
    } as never,
    position: { x: 100, y: 200 },
    verticalSpeed: 0,
    roundIteration: 0,
    closestObstacleGapPosition: { x: 500, y: 300 },
    delta: 10,
    cooldownCounter: 0,
    alive: true,
})

describe('HumanControlledBird.getFixture', () => {
    it('returns the provided fixture', () => {
        const bird = new HumanControlledBird(makeFixture())
        const fixture = bird.getFixture()
        expect(fixture.type).toBe(BirdTypes.HUMAN)
        expect(fixture.textureKey).toBe('bird')
    })
})

describe('HumanControlledBird.shouldFlap', () => {
    afterEach(() => {
        EventBus.removeAllListeners?.()
    })

    it('returns false when no key pressed and no pointer event', () => {
        const bird = new HumanControlledBird(makeFixture())
        bird.update(makeUpdateData())
        expect(bird.shouldFlap()).toBe(false)
    })

    it('returns true when GAME_CONTAINER_POINTER_DOWN event is emitted', () => {
        const bird = new HumanControlledBird(makeFixture())
        bird.update(makeUpdateData())
        EventBus.emit(GameEvents.GAME_CONTAINER_POINTER_DOWN)
        expect(bird.shouldFlap()).toBe(true)
    })

    it('clears commands after shouldFlap so it returns false on next call', () => {
        const bird = new HumanControlledBird(makeFixture())
        bird.update(makeUpdateData())
        EventBus.emit(GameEvents.GAME_CONTAINER_POINTER_DOWN)
        bird.shouldFlap()
        expect(bird.shouldFlap()).toBe(false)
    })

    it('returns true when keyboard key isDown', () => {
        const bird = new HumanControlledBird(makeFixture())
        const mockKey = { isDown: true }
        bird.update(makeUpdateData({ addKey: vi.fn(() => mockKey) }))
        expect(bird.shouldFlap()).toBe(true)
    })

    it('emits HUMAN_CONTROLLED_BIRD_FLAPPED when flapping', () => {
        const bird = new HumanControlledBird(makeFixture())
        bird.update(makeUpdateData())
        const spy = vi.fn()
        EventBus.on(GameEvents.HUMAN_CONTROLLED_BIRD_FLAPPED, spy)
        EventBus.emit(GameEvents.GAME_CONTAINER_POINTER_DOWN)
        bird.shouldFlap()
        expect(spy).toHaveBeenCalledOnce()
    })
})

describe('HumanControlledBird.onPassedPipe', () => {
    afterEach(() => {
        EventBus.removeAllListeners?.()
    })

    it('emits HUMAN_CONTROLLED_BIRD_PASSED_PIPE while alive', () => {
        const bird = new HumanControlledBird(makeFixture())
        const spy = vi.fn()
        EventBus.on(GameEvents.HUMAN_CONTROLLED_BIRD_PASSED_PIPE, spy)
        bird.onPassedPipe()
        expect(spy).toHaveBeenCalledOnce()
    })

    it('does not emit HUMAN_CONTROLLED_BIRD_PASSED_PIPE after death', () => {
        const bird = new HumanControlledBird(makeFixture())
        const spy = vi.fn()
        EventBus.on(GameEvents.HUMAN_CONTROLLED_BIRD_PASSED_PIPE, spy)
        bird.onHitFloor()
        bird.onPassedPipe()
        expect(spy).not.toHaveBeenCalled()
    })
})

describe('HumanControlledBird.onHitFloor', () => {
    afterEach(() => {
        EventBus.removeAllListeners?.()
    })

    it('emits HUMAN_CONTROLLED_BIRD_DIED', () => {
        const bird = new HumanControlledBird(makeFixture())
        const spy = vi.fn()
        EventBus.on(GameEvents.HUMAN_CONTROLLED_BIRD_DIED, spy)
        bird.onHitFloor()
        expect(spy).toHaveBeenCalledOnce()
    })
})

describe('HumanControlledBird.onHitTopPipeObstacle', () => {
    afterEach(() => {
        EventBus.removeAllListeners?.()
    })

    it('emits HUMAN_CONTROLLED_BIRD_DIED', () => {
        const bird = new HumanControlledBird(makeFixture())
        const spy = vi.fn()
        EventBus.on(GameEvents.HUMAN_CONTROLLED_BIRD_DIED, spy)
        bird.onHitTopPipeObstacle()
        expect(spy).toHaveBeenCalledOnce()
    })
})
