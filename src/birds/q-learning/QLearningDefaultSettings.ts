import { gameConstants } from '../../game/GameConstants'
import { BirdTypes } from '../../settings/BirdTypes'
import { QLearningSettings } from './QLearningSettings'

export const qLearningDefaultSettings: QLearningSettings = {
    initialPositionHorizontalOffset: -15,
    label: 'Q-Learning',
    cssColor: 'var(--bs-info)',
    birdType: BirdTypes.Q_LEARNING,
    enabled: false,
    texture: gameConstants.spriteSheet.assets.birdBlue.name,
    totalPopulation: {
        min: 1,
        max: 1,
        value: 1,
        step: 1,
    },
    learningRate: {
        min: 0.0,
        max: 1.0,
        value: 0.5,
        step: 0.01,
    },
    discountFactor: {
        min: 0.0,
        max: 1,
        value: 0.75,
        step: 0.01,
    },
    gridSpatialAbstraction: {
        horizontal: {
            min: 5,
            max: gameConstants.gameDimensions.width / 4,
            value: 15, //gameConstants.physics.pixelsPerFrame / 4,
            step: 1,
        },
        vertical: {
            min: 5,
            max: gameConstants.gameDimensions.height / 4,
            value: 8, //gameConstants.obstacles.verticalOffset.total,
            step: 1,
        },
    },
    verticalVelocityDiscretization: {
        min: 1,
        max: 10,
        value: 5,
        step: 1,
    },
    rewards: {
        hitTopPipe: {
            min: -1000,
            max: 0,
            value: -15,
            step: 5,
        },
        hitBottomPipe: {
            min: -1000,
            max: 0,
            value: -15,
            step: 5,
        },
        secondsAlive: {
            min: 0,
            max: 100,
            value: 1,
            step: 1,
        },
        passedPipe: {
            min: 1,
            max: 100,
            value: 100,
            step: 1,
        },
        hitFloor: {
            min: -1000,
            max: 0,
            value: -50,
            step: 5,
        },
        hitCeiling: {
            min: -1000,
            max: 0,
            value: -50,
            step: 5,
        },
    },
}
