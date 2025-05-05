import { QTable } from '../ai/q-table/QTableHandler'

export enum BirdTypes {
    HUMAN = 'HUMAN',
    NEURO_EVOLUTIONARY = 'NEURO_EVOLUTIONARY',
    SIMULATED_ANNEALING = 'SIMULATED_ANNEALING',
    Q_TABLE = 'Q_TABLE',
}

export type Range = {
    min: number
    max: number
    value: number
    step: number
}

export type BirdSettings = {
    initialPositionHorizontalOffset: number
    enabled: boolean
    texture: string
    birdType: BirdTypes
}

export type QLearningSettings = {
    birdType: BirdTypes.Q_TABLE
    //The learning rate controls how quickly the model is adapted to the problem, and is often in the range between 0.0 and 1.0.
    learningRate: Range

    //The discount factor is a measure of how much we want to care about future rewards rather than immediate rewards.
    //It is usually fairly high (because we put greater importance on long term gains) and between 0 and 1.
    discountFactor: Range

    // The grid spatial abstraction is used to reduce the number of states in the Q-table.
    gridSpatialAbstraction: {
        horizontal: Range
        vertical: Range
    }

    // The time grid in milliseconds is used to reduce the number of states in the Q-table.
    timeGridInMs: Range

    reward: {
        die: Range
        stayAlive: Range
    }
    // The Q-table is a dictionary that maps states to action values.
    qTable?: QTable
} & BirdSettings
