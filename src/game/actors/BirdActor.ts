import { Geom, Scene } from 'phaser'
import { gameConstants } from '../GameConstants'
import { BirdProps, Commands, UpdateData } from './BirdProps'
import { ObstacleActor } from './ObstacleActor'
import { EventBus, GameEvents } from '../EventBus'

type BirdActorUpdateProps = {
    delta: number
    closestObstacle?: ObstacleActor
    roundIteration: number
}

type BirdActorFixture = {
    props: BirdProps
    scene: Scene
    id: string
}

export class BirdActor {
    private readonly birdSprite: Phaser.GameObjects.Sprite
    private readonly hitBoxSprite: Phaser.GameObjects.Sprite
    private readonly id: string

    private pipesPassed: number = 0
    private timeAlive: number = 0
    private verticalSpeed: number = 0
    protected alive: boolean = true
    protected cooldownCounter: number = 0
    protected commands: Commands[] = []
    protected props: BirdProps

    public constructor(options: BirdActorFixture) {
        this.id = options.id
        this.props = options.props
        ;[this.birdSprite, this.hitBoxSprite] = this.createSprites(options.scene)
    }

    public getProps(): BirdProps {
        return this.props
    }

    public getId(): string {
        return this.id
    }

    private createSprites(scene: Scene): Phaser.GameObjects.Sprite[] {
        const scale = gameConstants.spriteSheet.scale
        const textureKey = this.props.getFixture().textureKey
        const birdSprite = scene.add.sprite(
            this.props.getFixture().initialPosition.x,
            this.props.getFixture().initialPosition.y,
            textureKey
        )
        birdSprite.setScale(scale)
        const depthRange = gameConstants.birdAttributes.spriteDepth.max - gameConstants.birdAttributes.spriteDepth.min
        birdSprite.setDepth(Math.random() * depthRange + gameConstants.birdAttributes.spriteDepth.min)
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
            this.props.getFixture().initialPosition.x,
            this.props.getFixture().initialPosition.y,
            textureKey
        )
        hitBoxSprite.setScale(scale * gameConstants.spriteSheet.hitBoxScale)
        hitBoxSprite.setAlpha(0)
        return [birdSprite, hitBoxSprite]
    }

    public update(updateProps: BirdActorUpdateProps): void {
        this.adjustSprite(updateProps.delta)
        this.applyGravity(updateProps)
        this.updateSoul(updateProps)
        if (this.alive) {
            this.timeAlive += updateProps.delta
            this.handleCommands()
            this.handleFloorAndCeilingCollision()
            this.handleObstacleCollision(updateProps)
        }
    }

    public isAlive(): boolean {
        return this.alive
    }

    public getHitBox() {
        return this.hitBoxSprite.getBounds()
    }

    public getPipesPassed(): number {
        return this.pipesPassed
    }

    public passedPipe() {
        this.pipesPassed++
        this.props.onPassedPipe()
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
                this.birdSprite.anims.play(this.props.getFixture().textureKey)
            }
        } else {
            this.birdSprite.x -= delta * gameConstants.physics.horizontalVelocityInPixelsPerMs
        }
    }

    private updateSoul(updateProps: BirdActorUpdateProps) {
        this.cooldownCounter -= updateProps.delta
        const props: UpdateData = {
            scene: this.birdSprite.scene,
            verticalSpeed: this.verticalSpeed,
            position: {
                x: this.birdSprite.x,
                y: this.birdSprite.y,
            },
            closestObstacleGapPosition: updateProps.closestObstacle?.getPosition(),
            roundIteration: updateProps.roundIteration,
            delta: updateProps.delta,
            cooldownCounter: this.cooldownCounter,
            alive: this.alive,
        }
        this.props.update(props)
        if (this.cooldownCounter <= 0) {
            if (this.props.shouldFlap()) {
                this.commands.push(Commands.FLAP_WING)
                this.cooldownCounter = gameConstants.birdAttributes.flapCoolDownMs
            }
        }
    }

    private handleObstacleCollision(options: BirdActorUpdateProps): void {
        if (options.closestObstacle) {
            const birdHitboxSprite = this.hitBoxSprite.getBounds()
            const topPipeHitBox = options.closestObstacle.getTopPipeHitBox()
            const bottomPipeHitBox = options.closestObstacle.getBottomPipeHitBox()
            if (Geom.Intersects.RectangleToRectangle(topPipeHitBox, birdHitboxSprite)) {
                this.kill()
                this.props.onHitTopPipeObstacle()
            } else if (Geom.Intersects.RectangleToRectangle(birdHitboxSprite, bottomPipeHitBox)) {
                this.kill()
                this.props.onHitBottomPipeObstacle()
            }
        }
    }

    public isOutOfScreen(): boolean {
        return this.birdSprite.x + this.birdSprite.displayWidth < 0
    }

    public kill(): void {
        if (this.alive) {
            EventBus.emit(GameEvents.BIRD_DIED, this.getProps())
            this.verticalSpeed = 0
            this.alive = false
            this.birdSprite.anims && this.birdSprite.anims.pause()
            this.birdSprite.setAlpha(0.4)
        }
    }

    public destroy(): void {
        this.props.onDestroy()
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
            this.kill()
            this.props.onHitFloor()
        }
        if (birdBounds.top < 0) {
            this.kill()
            this.props.onHitCeiling()
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
