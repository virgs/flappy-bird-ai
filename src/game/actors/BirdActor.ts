import { Geom, Scene } from 'phaser'
import { gameConstants } from '../GameConstants'
import { BirdSoul, Commands } from './BirdSoul'
import { ObstacleActor } from './ObstacleActor'

type BirdActorUpdateProps = {
    delta: number
    closestObstacle?: ObstacleActor
    roundIteration: number
}

export class BirdActor {
    private readonly birdSprite: Phaser.GameObjects.Sprite
    private readonly hitBoxSprite: Phaser.GameObjects.Sprite

    private timeAlive: number = 0
    private verticalSpeed: number = 0
    protected alive: boolean = true
    protected inputTimeCounterMs: number = 0
    protected commands: Commands[] = []
    protected soul: BirdSoul

    public constructor(soul: BirdSoul, scene: Scene) {
        this.soul = soul
        ;[this.birdSprite, this.hitBoxSprite] = this.createSprites(scene)
    }

    public getSoul(): BirdSoul {
        return this.soul
    }

    private createSprites(scene: Scene): Phaser.GameObjects.Sprite[] {
        const scale = gameConstants.spriteSheet.scale
        const textureKey = this.soul.getSoulProperties().textureKey
        const birdSprite = scene.add.sprite(
            this.soul.getSoulProperties().initialPosition.x,
            this.soul.getSoulProperties().initialPosition.y,
            textureKey
        )
        birdSprite.setScale(scale)
        birdSprite.setDepth(5)
        if (!scene.anims.get(textureKey)) {
            scene.anims.create({
                key: textureKey,
                frames: scene.anims.generateFrameNumbers(textureKey, gameConstants.spriteSheet.frameNumbers),
                repeat: gameConstants.spriteSheet.animation.repeat,
                frameRate: gameConstants.spriteSheet.animation.frameRate,
            })
        }
        birdSprite.anims.play(textureKey)

        const hitBoxSprite = scene.add.sprite(
            this.soul.getSoulProperties().initialPosition.x,
            this.soul.getSoulProperties().initialPosition.y,
            textureKey
        )
        hitBoxSprite.setScale(scale * gameConstants.spriteSheet.hitBoxScale)
        hitBoxSprite.setAlpha(0)
        return [birdSprite, hitBoxSprite]
    }

    public update(updateProps: BirdActorUpdateProps): void {
        if (this.alive) {
            this.timeAlive += updateProps.delta
            this.updateSoul(updateProps)
            this.handleCommands()
            this.handleFloorAndCeilingCollision()
            this.handleObstacleCollision(updateProps)
        }
        this.adjustSprite(updateProps.delta)
        this.applyGravity(updateProps)
    }

    public isAlive(): boolean {
        return this.alive
    }

    public getHitBox() {
        return this.hitBoxSprite.getBounds()
    }

    public passedPipe() {
        this.soul.onPassedPipe()
    }

    private adjustSprite(delta: number) {
        if (this.alive) {
            const angle =
                (this.verticalSpeed / gameConstants.birdAttributes.maxBirdVerticalSpeed) *
                gameConstants.birdAttributes.maxBirdAngle
            this.birdSprite.setAngle(angle)
            this.hitBoxSprite.setAngle(angle)
            if (angle >= gameConstants.birdAttributes.maxBirdAngle) {
                this.birdSprite.anims.stop()
            } else if (!this.birdSprite.anims.isPlaying) {
                this.birdSprite.anims.play(this.soul.getSoulProperties().textureKey)
            }
        } else {
            this.birdSprite.x -= delta * gameConstants.physics.horizontalVelocityInPixelsPerMs
        }
    }

    private updateSoul(updateProps: BirdActorUpdateProps) {
        this.inputTimeCounterMs += updateProps.delta
        const closestObstacleGapVerticalPosition = updateProps.closestObstacle?.getVerticalOffset() ?? 0
        const horizontalDistanceToClosestPipe = updateProps.closestObstacle?.getHorizontalPosition()
            ? updateProps.closestObstacle.getHorizontalPosition() - this.hitBoxSprite.getCenter().x
            : 0

        this.soul.update({
            scene: this.birdSprite.scene,
            verticalSpeed: this.verticalSpeed,
            verticalPosition: this.hitBoxSprite.getCenter().y,
            closestPipeGapVerticalPosition: closestObstacleGapVerticalPosition,
            horizontalDistanceToClosestPipe: horizontalDistanceToClosestPipe,
            roundIteration: updateProps.roundIteration,
            delta: updateProps.delta,
        })
        if (this.inputTimeCounterMs > gameConstants.birdAttributes.flapCoolDownMs) {
            if (this.soul.shouldFlap()) {
                this.commands.push(Commands.FLAP_WING)
                this.inputTimeCounterMs = 0
            }
        }
    }

    private handleObstacleCollision(options: BirdActorUpdateProps): void {
        if (options.closestObstacle) {
            const birdHitboxSprite = this.hitBoxSprite.getBounds()
            if (
                options.closestObstacle
                    .getHitBoxes()
                    .some(obstacleHitBox => Geom.Intersects.RectangleToRectangle(obstacleHitBox, birdHitboxSprite))
            ) {
                this.killBird()
                this.soul.onHitObstacle()
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
        }
    }

    public destroy(): void {
        this.birdSprite.destroy()
        this.hitBoxSprite.destroy()
    }

    private applyGravity(options: { delta: number }): void {
        const instantVerticalVelocity = gameConstants.physics.gravity * options.delta
        const verticalOffset = options.delta * (this.verticalSpeed + instantVerticalVelocity / 2)
        this.birdSprite.y = this.birdSprite.y + verticalOffset
        this.hitBoxSprite.y = this.hitBoxSprite.y + verticalOffset
        this.verticalSpeed = this.verticalSpeed + instantVerticalVelocity
        if (this.verticalSpeed > gameConstants.birdAttributes.maxBirdVerticalSpeed) {
            this.verticalSpeed = gameConstants.birdAttributes.maxBirdVerticalSpeed
        }
        if (this.birdSprite.y > gameConstants.gameDimensions.height - gameConstants.gameDimensions.floorHeight) {
            this.birdSprite.y = gameConstants.gameDimensions.height - gameConstants.gameDimensions.floorHeight
            this.hitBoxSprite.y = gameConstants.gameDimensions.height - gameConstants.gameDimensions.floorHeight
        }
    }

    private handleFloorAndCeilingCollision(): void {
        const birdBounds = this.hitBoxSprite.getBounds()
        if (birdBounds.bottom > gameConstants.gameDimensions.height - gameConstants.gameDimensions.floorHeight) {
            this.killBird()
            this.soul.onHitFloorOrCeiling()
        }
        if (birdBounds.top < 0) {
            this.killBird()
            this.soul.onHitFloorOrCeiling()
        }
    }

    private handleCommands(): void {
        this.commands.forEach(command => {
            switch (command) {
                case Commands.FLAP_WING:
                    this.verticalSpeed = -gameConstants.birdAttributes.flapImpulse
            }
        })
        this.commands = []
    }
}
