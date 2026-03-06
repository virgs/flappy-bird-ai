import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest'

afterEach(() => cleanup())

// jsdom does not implement ResizeObserver
beforeAll(() => {
    vi.stubGlobal('ResizeObserver', class {
        observe = vi.fn()
        unobserve = vi.fn()
        disconnect = vi.fn()
    })
})

vi.mock('phaser', () => ({
    Events: { EventEmitter: class { on = vi.fn(); emit = vi.fn(); off = vi.fn() } },
    Scene: class {},
}))

vi.mock('../game/GameConstants', () => ({
    gameConstants: {
        gameDimensions: { width: 1024, height: 768 },
        physics: { timeFactor: { min: 0.1, max: 50, default: 1, step: 0.1 } },
        spriteSheet: { assets: { birdBlue: { name: 'birdBlue' } } },
        birdAttributes: { flapImpulse: 0.75, maxBirdVerticalSpeed: 0.75 },
    },
}))

vi.mock('../repository/Repository', () => ({
    Repository: {
        isMuted: vi.fn().mockReturnValue(false),
        getTimeFactor: vi.fn().mockReturnValue(1),
        saveTimeFactor: vi.fn(),
        saveMute: vi.fn(),
    },
}))

vi.mock('../game/EventBus', () => ({
    EventBus: { on: vi.fn(), emit: vi.fn(), off: vi.fn() },
    GameEvents: {
        TIME_FACTOR_CHANGED: 'time-factor-changed',
        NEW_ROUND_STARTED: 'new-round-started',
        UPDATE_GAME_SCENE: 'update-game-scene',
        NEXT_ITERATION: 'next-iteration',
    },
}))

import { NavbarComponent } from './NavbarComponent'

const renderNavbar = () =>
    render(<NavbarComponent onHeightChange={vi.fn()} onGameAbort={vi.fn()} />)

describe('NavbarComponent', () => {
    it('always renders the Coffee button', () => {
        renderNavbar()
        expect(screen.getByRole('button', { name: /coffee/i })).toBeInTheDocument()
    })

    it('Coffee button links to buymeacoffee and opens in a new tab', () => {
        renderNavbar()
        const button = screen.getByRole('button', { name: /coffee/i })
        expect(button).toHaveAttribute('href', 'https://www.buymeacoffee.com/virgs')
        expect(button).toHaveAttribute('target', '_blank')
        expect(button).toHaveAttribute('rel', 'noopener noreferrer')
    })

    it('Coffee button has the warning (yellow) variant class', () => {
        renderNavbar()
        const button = screen.getByRole('button', { name: /coffee/i })
        expect(button.className).toMatch(/btn-warning/)
    })

    it('Coffee button text label has d-none d-lg-inline class to hide on small screens', () => {
        renderNavbar()
        const label = screen.getByText('Coffee')
        expect(label.className).toMatch(/d-none/)
        expect(label.className).toMatch(/d-lg-inline/)
    })

    it('does not render the sound toggle when no round is active', () => {
        renderNavbar()
        expect(screen.queryByRole('checkbox')).not.toBeInTheDocument()
    })

    it('speed slider container has navbar-grid class for CSS-grid centering', () => {
        renderNavbar()
        const speedSlider = document.querySelector('#speed-slider')
        const grid = speedSlider?.closest('.navbar-grid')
        expect(grid).toBeInTheDocument()
    })
})
