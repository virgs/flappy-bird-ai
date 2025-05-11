import { Geom } from 'phaser'
import { gameConstants } from '../GameConstants'

type ObstacleActorProps = {
    scene: Phaser.Scene
}

export class ObstacleActor {
    private readonly position: Geom.Point
    private readonly verticalOffset: number
    private readonly topPipeSprite: Phaser.GameObjects.Sprite
    private readonly bottomPipeSprite: Phaser.GameObjects.Sprite
    private outOfScreen: boolean = false

    constructor(options: ObstacleActorProps) {
        const verticalOffsetOptions = Array.from(
            { length: gameConstants.obstacles.verticalOffset.total },
            (_, i) =>
                gameConstants.obstacles.verticalOffset.min +
                (i * (gameConstants.obstacles.verticalOffset.max - gameConstants.obstacles.verticalOffset.min)) /
                    gameConstants.obstacles.verticalOffset.total
        )
        const randomIndex = Math.floor(Math.random() * verticalOffsetOptions.length)
        this.verticalOffset = verticalOffsetOptions[randomIndex] * gameConstants.gameDimensions.height
        this.position = new Geom.Point(gameConstants.gameDimensions.width, this.verticalOffset)
        ;[this.topPipeSprite, this.bottomPipeSprite] = this.createSprites(options)
    }

    public update(options: { delta: number }): void {
        const horizontalOffset = options.delta * gameConstants.physics.horizontalVelocityInPixelsPerMs
        this.position.x -= horizontalOffset
        this.topPipeSprite.x -= horizontalOffset
        this.bottomPipeSprite.x -= horizontalOffset
        if (
            this.topPipeSprite.x + this.topPipeSprite.displayWidth < 0 &&
            this.bottomPipeSprite.x + this.bottomPipeSprite.displayWidth < 0
        ) {
            this.outOfScreen = true
        }
    }

    public destroy(): void {
        this.topPipeSprite.destroy()
        this.bottomPipeSprite.destroy()
    }

    public getTopPipeHitBox(): Phaser.Geom.Rectangle {
        return this.topPipeSprite.getBounds()
    }

    public getBottomPipeHitBox(): Phaser.Geom.Rectangle {
        return this.bottomPipeSprite.getBounds()
    }

    public getPosition(): Geom.Point {
        return this.position
    }

    public isOutOfScreen(): boolean {
        return this.outOfScreen
    }

    private createSprites(options: ObstacleActorProps): Phaser.GameObjects.Sprite[] {
        const scale = gameConstants.obstacles.scale
        const topPipeSprite = options.scene.add.sprite(
            this.position.x,
            this.position.y,
            gameConstants.imageAssets.topPipe.name
        )
        topPipeSprite.displayOriginX = 0
        topPipeSprite.displayOriginY = 0
        topPipeSprite.setScale(scale)
        topPipeSprite.setDepth(10)
        topPipeSprite.y -= scale * topPipeSprite.height

        const bottomPipeSprite = options.scene.add.sprite(
            this.position.x,
            this.position.y + topPipeSprite.height + gameConstants.obstacles.verticalGapInPixels,
            gameConstants.imageAssets.bottomPipe.name
        )
        bottomPipeSprite.displayOriginX = 0
        bottomPipeSprite.displayOriginY = 0
        bottomPipeSprite.setScale(scale)
        bottomPipeSprite.setDepth(10)
        return [topPipeSprite, bottomPipeSprite]
    }
}
