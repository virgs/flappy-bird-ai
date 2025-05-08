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
    position: {
        x: number
        y: number
    }
    verticalSpeed: number
    roundIteration: number
    closestObstacleGapPosition?: {
        x: number
        y: number
    }
    delta: number
    cooldownCounter: number
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

    public onDestroy(): void {
        /* hook method */
    }
}
