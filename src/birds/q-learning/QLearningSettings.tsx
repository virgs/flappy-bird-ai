import { QTableHandler } from './QTableHandler';
import { BirdTypes, Range, BirdSettings } from '../../settings/BirdSettings';


export type QLearningRewards = {
    hitFloorOrCeiling: Range
    stayAlive: Range
    passedPipe: Range
    hitObstacle: Range
}

export type QLearningSettings = {
    birdType: BirdTypes.Q_LEARNING;

    // The learning rate controls how quickly the model is adapted to the problem, and is often in the range between 0.0 and 1.0.
    learningRate: Range;

    // The discount factor is a measure of how much we want to care about future rewards rather than immediate rewards.
    // It is usually fairly high (because we put greater importance on long term gains) and between 0 and 1.
    discountFactor: Range;

    // The grid spatial abstraction is used to reduce the number of states in the Q-table.
    gridSpatialAbstraction: {
        horizontal: Range;
        vertical: Range;
    };

    rewards: QLearningRewards;

    // The qTable shared between all birds
    qTableHandler?: QTableHandler;
} & BirdSettings;
