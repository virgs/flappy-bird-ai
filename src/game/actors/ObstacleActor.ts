import { Geom } from 'phaser'
import { gameConstants } from '../GameConstants'

type ObstacleActorProps = {
    scene: Phaser.Scene
}

export class ObstacleActor {
    public getHitBoxes() {
        return this.pipesSprites.map(sprite => {
            const bounds = sprite.getBounds()
            return new Geom.Rectangle(bounds.x, bounds.y, bounds.width, bounds.height)
        })
    }
    private readonly verticalOffset: number
    private readonly pipesSprites: Phaser.GameObjects.Sprite[] = []
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
        const position = new Geom.Point(gameConstants.gameDimensions.width, this.verticalOffset)
        this.createSprites(options, position)
    }

    public update(options: { delta: number }): void {
        this.pipesSprites.forEach(
            sprite => (sprite.x -= options.delta * gameConstants.physics.horizontalVelocityInPixelsPerMs)
        )
        if (this.pipesSprites.every(sprite => sprite.x + sprite.displayWidth < 0)) {
            this.outOfScreen = true
        }
    }

    public getVerticalOffset() {
        return this.verticalOffset
    }

    public destroy(): void {
        this.pipesSprites.forEach(sprite => sprite.destroy())
    }

    public getHorizontalPosition(): number {
        return this.pipesSprites[0].x
    }

    public isOutOfScreen(): boolean {
        return this.outOfScreen
    }

    private createSprites(options: ObstacleActorProps, position: Phaser.Geom.Point) {
        const scale = gameConstants.obstacles.scale
        const topPipeSprite = options.scene.add.sprite(position.x, position.y, gameConstants.assets.topPipe.name)
        topPipeSprite.displayOriginX = 0
        topPipeSprite.displayOriginY = 0
        topPipeSprite.setScale(scale)
        topPipeSprite.setDepth(10)
        topPipeSprite.y -= scale * topPipeSprite.height
        this.pipesSprites.push(topPipeSprite)

        const bottomPipeSprite = options.scene.add.sprite(
            position.x,
            position.y + topPipeSprite.height + gameConstants.obstacles.verticalGapInPixels,
            gameConstants.assets.bottomPipe.name
        )
        bottomPipeSprite.displayOriginX = 0
        bottomPipeSprite.displayOriginY = 0
        bottomPipeSprite.setScale(scale)
        bottomPipeSprite.setDepth(10)
        this.pipesSprites.push(bottomPipeSprite)
    }
}
