import { Geom } from 'phaser'
import { BirdSettings } from '../../settings/BirdSettings'
import { constants } from '../Constants'
import { Obstacle } from './Obstacle'

export enum Commands {
    FLAP_WING,
}

export type BirdProps = {
    onDieCallback: Function
    initialPosition: Phaser.Geom.Point
    playerSettings: BirdSettings
    scene: Phaser.Scene
}

type UpdateProps = {
    delta: number
    closestObstacle?: Obstacle
}

export abstract class Bird {
    private readonly birdSprite: Phaser.GameObjects.Sprite
    private readonly hitBoxSprite: Phaser.GameObjects.Sprite

    private verticalSpeed: number = 0
    protected alive: boolean = true
    protected inputTimeCounterMs: number = 0
    protected commands: Commands[] = []
    protected options: BirdProps

    protected constructor(options: BirdProps) {
        this.options = options
        ;[this.birdSprite, this.hitBoxSprite] = this.createSprite(options)
    }

    protected abstract childProcessInput(data: {
        verticalPosition: number
        closestPipeGapVerticalPosition: number
        horizontalDistanceToClosestPipe: number
        delta: number
    }): boolean

    private createSprite(options: {
        initialPosition: Phaser.Geom.Point
        scene: Phaser.Scene
    }): Phaser.GameObjects.Sprite[] {
        const scale = constants.spriteSheet.scale
        const textureKey = this.options.playerSettings.texture
        const birdSprite = options.scene.add.sprite(options.initialPosition.x, options.initialPosition.y, textureKey)
        birdSprite.setScale(scale)
        birdSprite.setDepth(10)
        if (!options.scene.anims.get(textureKey)) {
            options.scene.anims.create({
                key: textureKey,
                frames: options.scene.anims.generateFrameNumbers(textureKey, constants.spriteSheet.frameNumbers),
                repeat: constants.spriteSheet.animation.repeat,
                frameRate: constants.spriteSheet.animation.frameRate,
            })
        }
        birdSprite.anims.play(textureKey)

        const hitBoxSprite = options.scene.add.sprite(options.initialPosition.x, options.initialPosition.y, textureKey)
        hitBoxSprite.setScale(scale * constants.spriteSheet.hitBoxScale)
        hitBoxSprite.setAlpha(0)
        return [birdSprite, hitBoxSprite]
    }

    public update(options: UpdateProps): void {
        if (this.alive) {
            this.handleCommands()
            this.handleInput(options)
            this.handleFloorCollision()
            this.handleCeilingCollision()
            this.handleObstacleCollision(options)
            this.adjustSprite()
        } else {
            this.moveBackwards(options)
        }
        this.applyGravity(options)
    }

    private moveBackwards(options: UpdateProps) {
        this.birdSprite.x -= options.delta * constants.physics.horizontalVelocityInPixelsPerSecond
        this.hitBoxSprite.x -= options.delta * constants.physics.horizontalVelocityInPixelsPerSecond
    }

    private adjustSprite() {
        if (this.alive) {
            this.birdSprite.setAngle(
                (this.verticalSpeed / constants.birdAttributes.maxBirdVerticalSpeed) *
                    constants.birdAttributes.maxBirdAngle
            )
            this.hitBoxSprite.setAngle(
                (this.verticalSpeed / constants.birdAttributes.maxBirdVerticalSpeed) *
                    constants.birdAttributes.maxBirdAngle
            )
            if (this.verticalSpeed > 0) {
                this.birdSprite.anims.stop()
            } else if (!this.birdSprite.anims.isPlaying) {
                this.birdSprite.anims.play(this.options.playerSettings.texture)
            }
        }
    }

    private handleInput(options: UpdateProps) {
        this.inputTimeCounterMs += options.delta
        if (this.inputTimeCounterMs > constants.birdAttributes.flapCoolDownMs) {
            const closestObstacleGapVerticalPosition = options.closestObstacle?.getVerticalOffset() ?? 0
            const horizontalDistanceToClosestPipe = options.closestObstacle?.getHorizontalPosition()
                ? options.closestObstacle.getHorizontalPosition() - this.hitBoxSprite.getCenter().x
                : 0

            if (
                this.childProcessInput({
                    verticalPosition: this.hitBoxSprite.getCenter().y,
                    closestPipeGapVerticalPosition: closestObstacleGapVerticalPosition,
                    horizontalDistanceToClosestPipe,
                    delta: options.delta,
                })
            ) {
                this.inputTimeCounterMs = 0
            }
        }
    }

    private handleObstacleCollision(options: UpdateProps): void {
        if (options.closestObstacle) {
            const birdHitboxSprite = this.hitBoxSprite.getBounds()
            if (
                options.closestObstacle
                    .getHitBoxes()
                    .some(obstacleHitBox => Geom.Intersects.RectangleToRectangle(obstacleHitBox, birdHitboxSprite))
            ) {
                this.killBird()
            }
        }
    }

    public isOutOfScreen(): boolean {
        return this.birdSprite.x + this.birdSprite.displayWidth < 0
    }

    private killBird(): void {
        if (this.alive) {
            this.verticalSpeed = 0
            this.alive = false
            this.birdSprite.anims.pause()
            this.birdSprite.setAlpha(0.4)
            this.options.onDieCallback(this.options.playerSettings)
            this.onBirdDeath()
        }
    }

    public destroy(): void {
        this.birdSprite.destroy()
        this.hitBoxSprite.destroy()
    }

    protected onBirdDeath(): any {
        return null
    }

    private applyGravity(options: { delta: number }): void {
        const instantVerticalVelocity = constants.physics.gravity * options.delta
        const verticalOffset = options.delta * (this.verticalSpeed + instantVerticalVelocity / 2)
        this.birdSprite.y = this.birdSprite.y + verticalOffset
        this.hitBoxSprite.y = this.hitBoxSprite.y + verticalOffset
        this.verticalSpeed = this.verticalSpeed + instantVerticalVelocity
        if (this.verticalSpeed > constants.birdAttributes.maxBirdVerticalSpeed) {
            this.verticalSpeed = constants.birdAttributes.maxBirdVerticalSpeed
        }
        if (this.birdSprite.y > constants.gameDimensions.height - constants.gameDimensions.floorHeight) {
            this.birdSprite.y = constants.gameDimensions.height - constants.gameDimensions.floorHeight
            this.hitBoxSprite.y = constants.gameDimensions.height - constants.gameDimensions.floorHeight
        }
    }

    private handleFloorCollision(): void {
        const birdBounds = this.hitBoxSprite.getBounds()
        if (birdBounds.bottom > constants.gameDimensions.height - constants.gameDimensions.floorHeight) {
            this.killBird()
        }
    }

    private handleCeilingCollision(): void {
        const birdBounds = this.hitBoxSprite.getBounds()
        if (birdBounds.top < 0) {
            this.killBird()
        }
    }

    private handleCommands(): void {
        ;[...new Set(this.commands)].forEach(command => {
            switch (command) {
                case Commands.FLAP_WING:
                    this.verticalSpeed = -constants.birdAttributes.flapImpulse
            }
        })
        this.commands = []
    }
}
