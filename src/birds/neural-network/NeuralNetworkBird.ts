import { BirdSoul, BirdSoulProps, UpdateData } from '../../game/actors/BirdSoul'
import { gameConstants } from '../../game/GameConstants'
import { ArtificialNeuralNetwork, ArtificialNeuralNetworkInput } from './ArtificialNeuralNetwork'

export type NeuralNetworkBirdProps = BirdSoulProps & {
    annSettings: ArtificialNeuralNetworkInput
}

export class NeuralNetworkBird extends BirdSoul {
    private readonly _props: NeuralNetworkBirdProps
    private readonly ann: ArtificialNeuralNetwork
    private lastUpdateData: UpdateData

    public constructor(options: NeuralNetworkBirdProps) {
        super()
        this.ann = new ArtificialNeuralNetwork(options.annSettings)
        this._props = options
    }

    public getSoulProperties(): NeuralNetworkBirdProps {
        return this._props
    }

    public update(data: UpdateData): void {
        this.lastUpdateData = data
    }

    public shouldFlap(): boolean {
        const data = this.lastUpdateData
        if (data.closestObstacleGapPosition === undefined) {
            return false
        }

        const output = this.ann.process([
            data.position.y / gameConstants.gameDimensions.height,
            data.verticalSpeed / gameConstants.birdAttributes.maxBirdVerticalSpeed,
            (data.closestObstacleGapPosition.x - data.position.x) / gameConstants.gameDimensions.width,
            (data.closestObstacleGapPosition.y - data.position.y) / gameConstants.gameDimensions.height,
        ])
        return output[0] > 0.5
    }
}
