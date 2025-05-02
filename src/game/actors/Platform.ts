import { constants } from '../constants'

export class Platform {
    private readonly assetsWidthDifference = constants.gameDimensions.width / 2

    private readonly backgroundSprites: Phaser.GameObjects.Sprite[] = []
    private readonly floorSprites: Phaser.GameObjects.Sprite[] = []

    private readonly dayDurationInSeconds = 60
    private ellapsedTime: number = 0
    private alpha: number = 0

    constructor(options: { scene: Phaser.Scene }) {
        this.createBackgroundSprites(options)
        this.createFloorSprites(options)

        // EventManager.on(Events.DESTROY, () => {
        //     this.backgroundSprites.concat(this.floorSprites).forEach(sprite => sprite.destroy())
        // })
    }

    public update(options: { delta: number }): void {
        this.floorSprites.forEach(
            sprite => (sprite.x -= options.delta * constants.physics.horizontalVelocityInPixelsPerSecond)
        )
        if (this.floorSprites.some(sprite => sprite.x < -this.assetsWidthDifference)) {
            this.floorSprites.forEach(sprite => (sprite.x += this.assetsWidthDifference))
        }

        // Use a sine wave for alpha
        this.ellapsedTime += options.delta / 1000 // Convert delta to seconds
        if (this.ellapsedTime > this.dayDurationInSeconds) {
            this.ellapsedTime -= this.dayDurationInSeconds
        }
        const normalizedTime = (this.ellapsedTime / this.dayDurationInSeconds) * Math.PI * 2 // Full sine wave cycle
        this.alpha = (Math.sin(normalizedTime) + 1) / 2 // Scale sine wave to range [0, 1]

        this.backgroundSprites
            .filter((_, index) => index >= this.backgroundSprites.length / 2)
            .forEach(sprite => sprite.setAlpha(this.alpha))
    }

    private createBackgroundSprites(options: { scene: Phaser.Scene }) {
        ;[constants.assets.backgroundNight.name, constants.assets.backgroundDay.name].forEach(assetName => {
            console.log('createBackgroundSprites', assetName)
            const firstSprite = options.scene.add.sprite(0, 0, assetName)
            firstSprite.displayOriginX = 0
            firstSprite.displayOriginY = 0
            firstSprite.scaleX = constants.gameDimensions.width / firstSprite.displayWidth
            firstSprite.scaleY = constants.gameDimensions.height / firstSprite.displayHeight
            firstSprite.setDepth(99999999999)
            this.backgroundSprites.push(firstSprite)

            const secondSprite = options.scene.add.sprite(constants.gameDimensions.width, 0, assetName)
            secondSprite.displayOriginX = 0
            secondSprite.displayOriginY = 0
            secondSprite.scaleX = constants.gameDimensions.width / secondSprite.displayWidth
            secondSprite.scaleY = constants.gameDimensions.height / secondSprite.displayHeight
            secondSprite.setDepth(99999999999)

            this.backgroundSprites.push(secondSprite)
        })
    }

    private createFloorSprites(options: { scene: Phaser.Scene }) {
        const yPosition = constants.gameDimensions.height * 0.85
        const floorTextureKey = constants.assets.floor.name
        const firstFloorSprite = options.scene.add.sprite(0, yPosition, floorTextureKey)
        firstFloorSprite.displayOriginX = 0
        firstFloorSprite.displayOriginY = 0
        firstFloorSprite.setDepth(99999999999)
        firstFloorSprite.scaleX = constants.gameDimensions.width / firstFloorSprite.displayWidth
        firstFloorSprite.scaleY = (constants.gameDimensions.height * 0.15) / firstFloorSprite.displayHeight
        this.floorSprites.push(firstFloorSprite)

        const secondFloorSprite = options.scene.add.sprite(constants.gameDimensions.width, yPosition, floorTextureKey)
        secondFloorSprite.displayOriginX = 0
        secondFloorSprite.displayOriginY = 0
        secondFloorSprite.setDepth(99999999999)
        secondFloorSprite.scaleX = constants.gameDimensions.width / secondFloorSprite.displayWidth
        secondFloorSprite.scaleY = (constants.gameDimensions.height * 0.15) / secondFloorSprite.displayHeight
        this.floorSprites.push(secondFloorSprite)
    }
}
