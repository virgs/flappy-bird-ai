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
    public abstract shouldFlap(): boolean

    public abstract getSoulProperties(): BirdSoulProps

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
