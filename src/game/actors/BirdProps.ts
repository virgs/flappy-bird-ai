import { BirdTypes } from '../../settings/BirdTypes'

export enum Commands {
    FLAP_WING,
}

export type BirdPropsFixture = {
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
    alive: boolean
}

export abstract class BirdProps {
    public abstract shouldFlap(): boolean

    public abstract getFixture(): BirdPropsFixture

    public update(_data: UpdateData): void {
        /* hook method */
    }

    public onHitCeiling() {
        /* hook method */
    }

    public onHitFloor(): void {
        /* hook method */
    }

    public onHitTopPipeObstacle(): void {
        /* hook method */
    }

    public onHitBottomPipeObstacle() {
        /* hook method */
    }

    public onPassedPipe(): void {
        /* hook method */
    }

    public onDestroy(): void {
        /* hook method */
    }
}
