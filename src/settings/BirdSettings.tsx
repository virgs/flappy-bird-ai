
export enum BirdTypes {
    HUMAN = 'HUMAN',
    NEURO_EVOLUTIONARY = 'NEURO_EVOLUTIONARY',
    SIMULATED_ANNEALING = 'SIMULATED_ANNEALING',
    Q_LEARNING = 'Q_LEARNING',
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
    // The cssColor property is used to determine the color of the bird.
    cssColor: string
    // This is used to display the label of the bird in the UI.
    label: string
    // The texture is used to determine which texture will be used for the bird.
    texture: string
    // The bird type is used to determine which type of bird will be spawned in the game.
    birdType: BirdTypes
    // The initial position of the bird is used to determine where the bird will spawn in the game.
    initialPositionHorizontalOffset: number
    // The total population of birds is used to determine how many birds will be spawned in the game.
    totalPopulation: number
}

export type HumanSettings = BirdSettings


