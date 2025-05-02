
export type PlayerSettings = {
    human: {
        enabled: boolean;
    };
    neuroEvolutionaty: {
        enabled: boolean;
    };
    simmulatedAnnealing: {
        enabled: boolean;
    };
    qTable: {
        enabled: boolean;
    };
};


export const defaultPlayersSettings: PlayerSettings = {
    human: {
        enabled: true,
    },
    neuroEvolutionaty: {
        enabled: false,
    },
    simmulatedAnnealing: {
        enabled: false,
    },
    qTable: {
        enabled: false,
    },
}
