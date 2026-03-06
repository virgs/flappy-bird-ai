import { beforeEach, describe, expect, it, vi } from 'vitest'

// Mock GameConstants to avoid ?url asset imports
vi.mock('../game/GameConstants', () => ({
    gameConstants: {
        gameDimensions: { width: 1024, height: 768 },
        spriteSheet: { assets: { birdBlue: { name: 'birdBlue' }, birdGreen: { name: 'birdGreen' }, birdRed: { name: 'birdRed' }, birdYellow: { name: 'birdYellow' } } },
        physics: { timeFactor: { default: 1 } },
        birdAttributes: { flapImpulse: 0.75, maxBirdVerticalSpeed: 0.75 },
    },
}))

import { Repository } from './Repository'

// Provide an in-memory localStorage because jsdom 28+ uses file-backed storage
const localStorageMock = (() => {
    let store: Record<string, string> = {}
    return {
        getItem: (key: string): string | null => store[key] ?? null,
        setItem: (key: string, value: string): void => { store[key] = value },
        removeItem: (key: string): void => { delete store[key] },
        clear: (): void => { store = {} },
    }
})()

vi.stubGlobal('localStorage', localStorageMock)

describe('Repository', () => {
    beforeEach(() => {
        localStorage.clear()
    })

    describe('getGameSettings / saveCompetitorsSettings', () => {
        it('returns default settings when localStorage is empty', () => {
            const settings = Repository.getGameSettings()
            expect(settings).toBeDefined()
            expect(settings.humanSettings).toBeDefined()
        })

        it('returns saved settings after saving', () => {
            const initial = Repository.getGameSettings()
            initial.humanSettings.enabled = true
            Repository.saveCompetitorsSettings(initial)

            const loaded = Repository.getGameSettings()
            expect(loaded.humanSettings.enabled).toBe(true)
        })
    })

    describe('clearCompetitorsSettings', () => {
        it('removes saved settings so defaults are returned afterward', () => {
            const settings = Repository.getGameSettings()
            settings.humanSettings.enabled = true
            Repository.saveCompetitorsSettings(settings)

            Repository.clearCompetitorsSettings()

            // After clearing, should fall back to defaults
            expect(localStorage.getItem('gameSettings')).toBeNull()
        })
    })

    describe('getFactorySettings', () => {
        it('returns a deep clone of the defaults', () => {
            const a = Repository.getFactorySettings()
            const b = Repository.getFactorySettings()
            expect(a).toEqual(b)
            expect(a).not.toBe(b)
        })
    })

    describe('isMuted / saveMute', () => {
        it('returns false by default', () => {
            expect(Repository.isMuted()).toBe(false)
        })

        it('round-trips the muted state correctly', () => {
            Repository.saveMute(true)
            expect(Repository.isMuted()).toBe(true)

            Repository.saveMute(false)
            expect(Repository.isMuted()).toBe(false)
        })
    })

    describe('getTimeFactor / saveTimeFactor', () => {
        it('returns the default time factor when localStorage is empty', () => {
            const factor = Repository.getTimeFactor()
            expect(typeof factor).toBe('number')
            expect(factor).toBeGreaterThan(0)
        })

        it('round-trips a custom time factor correctly', () => {
            Repository.saveTimeFactor(3.5)
            expect(Repository.getTimeFactor()).toBe(3.5)
        })
    })
})
