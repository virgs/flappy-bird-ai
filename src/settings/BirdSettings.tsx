import { QTable } from '../game/actors/QTable'

export type BirdSettings = {
    enabled: boolean
    texture: string
    key: string
}

export type QTableSettings = {
    //The learning rate controls how quickly the model is adapted to the problem, and is often in the range between 0.0 and 1.0.
    learningRate: number

    //The discount factor is a measure of how much we want to care about future rewards rather than immediate rewards.
    //It is usually fairly high (because we put greater importance on long term gains) and between 0 and 1.
    discountFactor: number

    // The grid spatial abstraction is used to reduce the number of states in the Q-table.
    gridSpatialAbstraction: {
        horizontal: number
        vertical: number
    }

    // The time grid in milliseconds is used to reduce the number of states in the Q-table.
    timeGridInMs: number,

    reward: {
        die: number
        stayAlive: number,
    }
    // The Q-table is a dictionary that maps states to action values.
    qTable?: QTable
} & BirdSettings


