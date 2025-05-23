import { Events } from 'phaser'

export enum GameEvents {
    GAME_CONTAINER_POINTER_DOWN = 'game-container-pointer-down',
    ROUND_BEST_RESULTS = 'round-best-results',
    UPDATE_GAME_SCENE = 'update-game-scene',
    NEXT_ITERATION = 'next-iteration',
    NEW_GAME_STARTED = 'new-game-started',
    TIME_FACTOR_CHANGED = 'time-factor-changed',
    BIRDS_PASSED_PIPE = 'birds-passed-pipe',
    NEW_ROUND_STARTED = 'new-round-started',
    BIRD_DIED = 'bird-died',
    HUMAN_CONTROLLED_BIRD_PASSED_PIPE = 'human-controlled-bird-passed-pipe',
    HUMAN_CONTROLLED_BIRD_FLAPPED = 'human-controlled-bird-flapped',
    TOGGLE_SOUND = 'toggle-sound',
    HUMAN_CONTROLLED_BIRD_DIED = 'human-controlled-bird-died',
}

// Used to emit events between components, HTML and Phaser scenes
export const EventBus = new Events.EventEmitter()
