import { Geom, Scene } from 'phaser'
import { GameSettings } from '../../settings/GameSettings'
import { gameConstants } from '../GameConstants'
import { Bird } from './Birds'
import { HumanControlledBird } from './HumanControlledBird'
import { BirdQTable } from './BirdQTable'
import { BirdTypes } from '../../settings/BirdSettings'

export class BirdFactory {
    private static readonly birdsInitialPosition = new Geom.Point(
        gameConstants.birdAttributes.initialPosition.x,
        gameConstants.birdAttributes.initialPosition.y
    )

    static createBirds(scene: Scene, options: GameSettings): Bird[] {
        const birds: Bird[] = []
        if (options.humanSettings?.enabled) {
            birds.push(
                new HumanControlledBird({
                    type: options.humanSettings.birdType,
                    texture: options.humanSettings.texture,
                    initialPosition: this.birdsInitialPosition,
                    scene: scene,
                })
            )
        }
        const qTableSettings = options.qTableSettings
        if (qTableSettings.enabled) {
            birds.push(
                ...qTableSettings.birds.map(qTableBirdSettings => {
                    const position = new Geom.Point(
                        this.birdsInitialPosition.x + qTableSettings.initialPositionHorizontalOffset,
                        this.birdsInitialPosition.y + 10
                    )
                    return new BirdQTable({
                        type: BirdTypes.Q_TABLE,
                        qTableBirdSettings: qTableBirdSettings,
                        texture: qTableSettings.texture,
                        initialPosition: position,
                        scene: scene,
                    })
                })
            )
        }
        return birds
    }
}
