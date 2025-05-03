import { Geom, Scene } from 'phaser'
import { GameSettings } from '../../settings/GameSettings'
import { constants } from '../Constants'
import { Bird } from './Birds'
import { HumanControlledBird } from './HumanControlledBird'
import { BirdQTable } from './BirdQTable'

export class BirdFactory {
    private static readonly birdsInitialPosition = new Geom.Point(
        constants.birdAttributes.initialPosition.x,
        constants.birdAttributes.initialPosition.y
    )

    static createBirds(scene: Scene, options: GameSettings, onDieCallback: Function): Bird[] {
        const birds: Bird[] = []
        if (options.human?.enabled) {
            birds.push(
                new HumanControlledBird({
                    playerSettings: options.human,
                    initialPosition: this.birdsInitialPosition,
                    scene: scene,
                    onDieCallback: onDieCallback,
                })
            )
        }
        if (options.qTable?.enabled) {
            const position = new Geom.Point(this.birdsInitialPosition.x - 10, this.birdsInitialPosition.y + 10)
            birds.push(
                new BirdQTable({
                    playerSettings: options.qTable,
                    initialPosition: position,
                    scene: scene,
                    onDieCallback: onDieCallback,
                })
            )
        }
        return birds
    }
}
