export interface BirdAttributes {
    name: string;
    texture: string;
    color: string;
}

export const BirdValues: {
    [name: string]: BirdAttributes
} = {
    GENETICALLY_TRAINED: {
        name: 'Genetic',
        texture: 'bird-yellow',
        color: '#FFC200',
    },
    PLAYER_CONTROLLED: {
        name: 'Player',
        texture: 'bird-blue',
        color: '#00B5C2',
    },
    Q_TABLE: {
        name: 'qTable',
        texture: 'bird-green',
        color: '#00E852',
    },
    SIMULATED_ANNEALING: {
        name: 'Simulated Annealing',
        texture: 'bird-red',
        color: '#EF001D',
    },
};
