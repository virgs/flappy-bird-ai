import { Events } from 'phaser'

export enum GameEvents {
    GAME_CONTAINER_POINTER_DOWN = 'game-container-pointer-down',
    ROUND_BEST_RESULTS = 'round-best-results',
    UPDATE_GAME_SCENE = 'update-game-scene',
    NEXT_ITERATION = 'next-iteration',
    NEW_GAME_STARTED = 'new-game-started',
    TIME_FACTOR_CHANGED = 'time-factor-changed',
}

// Used to emit events between components, HTML and Phaser scenes
export const EventBus = new Events.EventEmitter()
