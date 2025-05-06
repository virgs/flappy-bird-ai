import { BirdTypes } from '../../settings/BirdSettings'

export enum Commands {
    FLAP_WING,
}

export type BirdSoulProps = {
    type: BirdTypes
    textureKey: string
    initialPosition: Phaser.Geom.Point
}

export type UpdateData = {
    scene: Phaser.Scene
    verticalPosition: number
    verticalSpeed: number
    roundIteration: number
    closestPipeGapVerticalPosition?: number
    horizontalDistanceToClosestPipe?: number
    delta: number
}

export abstract class BirdSoul {
    private readonly _props: BirdSoulProps

    public constructor(props: BirdSoulProps) {
        this._props = props
    }

    public abstract shouldFlap(): boolean

    public get props(): BirdSoulProps {
        return this._props
    }

    public update(_data: UpdateData): void {
        /* hook method */
    }

    public onHitFloorOrCeiling(): void {
        /* hook method */
    }

    public onHitObstacle(): void {
        /* hook method */
    }

    public onPassedPipe(): void {
        /* hook method */
    }
}
