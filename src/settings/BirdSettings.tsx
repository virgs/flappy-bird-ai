import { BirdTypes } from './BirdTypes'

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
    // The total population of birds is used to determine how many birds will be spawned in the game.
    totalPopulation: Range
}

export type HumanSettings = BirdSettings
