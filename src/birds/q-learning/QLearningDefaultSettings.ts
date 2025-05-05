import { gameConstants } from '../../game/GameConstants'
import { BirdTypes, QLearningSettings } from '../../settings/BirdSettings'

export const qLearningDefaultSettings: QLearningSettings = {
    initialPositionHorizontalOffset: -15,
    birdType: BirdTypes.Q_LEARNING,
    enabled: false,
    texture: gameConstants.spriteSheet.assets.birdBlue.name,
    totalPopulation: 100,
    learningRate: {
        min: 0.0,
        max: 1.0,
        value: 0.35,
        step: 0.01,
    },
    discountFactor: {
        min: 0.0,
        max: 1.0,
        value: 0.8,
        step: 0.01,
    },
    gridSpatialAbstraction: {
        horizontal: {
            min: 10,
            max: gameConstants.gameDimensions.width / 4,
            value: 20,
            step: 1,
        },
        vertical: {
            min: 10,
            max: gameConstants.gameDimensions.height / 4,
            value: gameConstants.obstacles.verticalOffset.total * 2,
            step: 1,
        },
    },
    timeGridInMs: {
        min: 100,
        max: 1000,
        value: 200,
        step: 10,
    },
    rewards: {
        die: {
            min: -100000,
            max: -1,
            value: -100000,
            step: 1000,
        },
        stayAlive: {
            min: 1,
            max: 100,
            value: 10,
            step: 1,
        },
        passedPipe: {
            min: 1,
            max: 100,
            value: 20,
            step: 1,
        },
    },
}
