import { QTable, QTableHandler } from '../birds/q-learning/QTableHandler'

export enum BirdTypes {
    HUMAN = 'HUMAN',
    NEURO_EVOLUTIONARY = 'NEURO_EVOLUTIONARY',
    SIMULATED_ANNEALING = 'SIMULATED_ANNEALING',
    Q_LEARNING = 'Q_TABLE',
}

export type Range = {
    min: number
    max: number
    value: number
    step: number
}

export type BirdSettings = {
    // The enabled property is used to determine if the bird is enabled or not.
    enabled: boolean
    // The texture is used to determine which texture will be used for the bird.
    texture: string
    // The bird type is used to determine which type of bird will be spawned in the game.
    birdType: BirdTypes
    // The initial position of the bird is used to determine where the bird will spawn in the game.
    initialPositionHorizontalOffset: number
    // The total population of birds is used to determine how many birds will be spawned in the game.
    totalPopulation: number

    // The qTable shared between all birds
    qTableHandler?: QTableHandler
}

export type QLearningRewards = {
    die: Range
    stayAlive: Range
    passedPipe: Range
}

export type HumanSettings = BirdSettings

export type QLearningSettings = {
    birdType: BirdTypes.Q_LEARNING
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

    rewards: QLearningRewards
    // The Q-table is a dictionary that maps states to action values.
    qTable?: QTable
} & BirdSettings
