import { gameConstants } from '../../game/GameConstants'
import { BirdTypes } from '../../settings/BirdSettings'
import { QLearningSettings } from './QLearningSettings'

export const qLearningDefaultSettings: QLearningSettings = {
    initialPositionHorizontalOffset: -15,
    birdType: BirdTypes.Q_LEARNING,
    enabled: true,
    texture: gameConstants.spriteSheet.assets.birdBlue.name,
    // totalPopulation: 100,
    totalPopulation: 1,
    learningRate: {
        min: 0.0,
        max: 1.0,
        value: 0.5,
        step: 0.01,
    },
    discountFactor: {
        min: 0.0,
        max: 1.0,
        value: 0.75,
        step: 0.01,
    },
    gridSpatialAbstraction: {
        horizontal: {
            min: 10,
            max: gameConstants.gameDimensions.width / 4,
            value: 30, //gameConstants.physics.pixelsPerFrame / 4,
            step: 1,
        },
        vertical: {
            min: 10,
            max: gameConstants.gameDimensions.height / 4,
            value: 20, //gameConstants.obstacles.verticalOffset.total,
            step: 1,
        },
    },
    timeGridInMs: {
        min: 0,
        max: 200,
        value: 50,
        step: 10,
    },
    rewards: {
        hitFloorOrCeiling: {
            min: -100,
            max: 0,
            value: -50,
            step: 10,
        },
        hitObstacle: {
            min: -100,
            max: 0,
            value: -15,
            step: 10,
        },
        stayAlive: {
            min: 0,
            max: 100,
            value: 0.1,
            step: 0.1,
        },
        passedPipe: {
            min: 1,
            max: 100,
            value: 100,
            step: 1,
        },
    },
}
