import { Geom, Scene } from 'phaser'
import { constants } from '../Constants'

type PipeOptions = {
    scene: Phaser.Scene
}

export class Pipe {
    private readonly gapInPixels = 80
    private readonly verticalOffset: number
    private readonly pipesSprites: Phaser.GameObjects.Sprite[] = []
    private readonly birdsXPosition: number
    private outOfScreen: boolean = false

    constructor(options: PipeOptions) {
        this.birdsXPosition = constants.birdAttributes.initialPosition.x

        const verticalOffsetOptions = Array.from({ length: 5 }, (_, i) => 0.1 + i * 0.1)
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
            this.pipesSprites.forEach(sprite => sprite.destroy())
            this.outOfScreen = true
        }
    }

    public isOutOfScreen(): boolean {
        return this.outOfScreen
    }

    private createSprites(options: PipeOptions, position: Phaser.Geom.Point) {
        const scale = 4
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
