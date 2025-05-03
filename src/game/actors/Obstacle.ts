import { Geom } from 'phaser'
import { constants } from '../Constants'

type ObstacleProps = {
    scene: Phaser.Scene
}

export class Obstacle {
    public getHitBoxes() {
        return this.pipesSprites.map(sprite => {
            const bounds = sprite.getBounds()
            return new Geom.Rectangle(bounds.x, bounds.y, bounds.width, bounds.height)
        })
    }
    private readonly gapInPixels = 80
    private readonly verticalOffset: number
    private readonly pipesSprites: Phaser.GameObjects.Sprite[] = []
    private readonly birdsXPosition: number
    private outOfScreen: boolean = false

    constructor(options: ObstacleProps) {
        this.birdsXPosition = constants.birdAttributes.initialPosition.x

        const verticalOffsetOptions = Array.from(
            { length: constants.obstacles.total },
            (_, i) =>
                constants.obstacles.minVerticalOffset +
                (i * (constants.obstacles.maxVerticalOffset - constants.obstacles.minVerticalOffset)) /
                    constants.obstacles.total
        )
        const randomIndex = Math.floor(Math.random() * verticalOffsetOptions.length)
        this.verticalOffset = verticalOffsetOptions[randomIndex] * constants.gameDimensions.height
        const position = new Geom.Point(constants.gameDimensions.width, this.verticalOffset)
        this.createSprites(options, position)
    }

    public update(options: { delta: number; onPassedBirds: () => void }): void {
        this.pipesSprites.forEach(
            sprite => (sprite.x -= options.delta * constants.physics.horizontalVelocityInPixelsPerSecond)
        )
        if (this.pipesSprites.every(sprite => sprite.getBounds().right < this.birdsXPosition)) {
            options.onPassedBirds()
        }
        if (this.pipesSprites.every(sprite => sprite.x + sprite.displayWidth < 0)) {
            this.outOfScreen = true
        }
    }

    getVerticalOffset() {
        return this.verticalOffset
    }

    destroy(): void {
        this.pipesSprites.forEach(sprite => sprite.destroy())
    }

    getHorizontalPosition(): number {
        return this.pipesSprites[0].x
    }

    public isOutOfScreen(): boolean {
        return this.outOfScreen
    }

    private createSprites(options: ObstacleProps, position: Phaser.Geom.Point) {
        const scale = constants.obstacles.scale
        const topPipeSprite = options.scene.add.sprite(position.x, position.y, constants.assets.topPipe.name)
        topPipeSprite.displayOriginX = 0
        topPipeSprite.displayOriginY = 0
        topPipeSprite.setScale(scale)
        topPipeSprite.setDepth(1)
        topPipeSprite.y -= scale * topPipeSprite.height
        this.pipesSprites.push(topPipeSprite)

        const bottomPipeSprite = options.scene.add.sprite(
            position.x,
            position.y + topPipeSprite.height + this.gapInPixels,
            constants.assets.bottomPipe.name
        )
        bottomPipeSprite.displayOriginX = 0
        bottomPipeSprite.displayOriginY = 0
        bottomPipeSprite.setScale(scale)
        bottomPipeSprite.setDepth(1)
        this.pipesSprites.push(bottomPipeSprite)
    }
}
