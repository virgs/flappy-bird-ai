export enum BirdTypes {
    HUMAN = 'HUMAN',
    GENETIC_ALGORITHM = 'GENETIC_ALGORITHM',
    SIMULATED_ANNEALING = 'SIMULATED_ANNEALING',
    Q_LEARNING = 'Q_LEARNING',
}

export const birdTypesList = [
    BirdTypes.HUMAN,
    BirdTypes.GENETIC_ALGORITHM,
    BirdTypes.SIMULATED_ANNEALING,
    BirdTypes.Q_LEARNING,
] as const
