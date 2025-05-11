import { QTableHandler } from './QTableHandler'
import { Range, BirdSettings } from '../../settings/BirdSettings'
import { BirdTypes } from '../../settings/BirdTypes'

export type QLearningRewards = {
    secondsAlive: Range
    hitCeiling: Range
    hitFloor: Range
    passedPipe: Range
    hitTopPipe: Range
    hitBottomPipe: Range
}

export type QLearningSettings = {
    birdType: BirdTypes.Q_LEARNING

    // Alpha
    // The learning rate controls how quickly the model is adapted to the problem, and is often in the range between 0.0 and 1.0.
    learningRate: Range

    // Gamma
    // The discount factor is a measure of how much we want to care about future rewards rather than immediate rewards.
    // It is usually fairly high (because we put greater importance on long term gains) and between 0 and 1.
    discountFactor: Range

    // The grid spatial abstraction is used to reduce the number of states in the Q-table.
    gridSpatialAbstraction: {
        horizontal: Range
        vertical: Range
    }

    // The vertical velocity discretization is used to reduce the number of states in the Q-table.
    verticalVelocityDiscretization: Range

    rewards: QLearningRewards

    // The qTable shared between all birds
    qTableHandler?: QTableHandler
} & BirdSettings
