import { BirdProps, BirdPropsFixture, UpdateData } from '../../game/actors/BirdProps'
import { gameConstants } from '../../game/GameConstants'
import { ArtificialNeuralNetwork, ArtificialNeuralNetworkInput } from './ArtificialNeuralNetwork'

export type NeuralNetworkBirdProps = BirdPropsFixture & {
    annSettings: ArtificialNeuralNetworkInput
}

export class NeuralNetworkBird extends BirdProps {
    private readonly _props: NeuralNetworkBirdProps
    private readonly ann: ArtificialNeuralNetwork
    private lastUpdateData?: UpdateData

    public constructor(options: NeuralNetworkBirdProps) {
        super()
        this.ann = new ArtificialNeuralNetwork(options.annSettings)
        this._props = options
    }

    public getFixture(): NeuralNetworkBirdProps {
        return this._props
    }

    public update(data: UpdateData): void {
        this.lastUpdateData = data
    }

    public shouldFlap(): boolean {
        if (!this.lastUpdateData) {
            return false
        }
        // When there is no obstacle, the gap position is set to vertical center and far right
        const closestObstacleGapPosition = this.lastUpdateData.closestObstacleGapPosition
            ? this.lastUpdateData.closestObstacleGapPosition
            : {
                  x: gameConstants.gameDimensions.width,
                  y: gameConstants.gameDimensions.height / 2,
              }
        const data = this.lastUpdateData
        const output = this.ann.process([
            data.position.y / gameConstants.gameDimensions.height,
            data.verticalSpeed / gameConstants.birdAttributes.maxBirdVerticalSpeed,
            (closestObstacleGapPosition.x - data.position.x) / gameConstants.gameDimensions.width,
            (closestObstacleGapPosition.y - data.position.y) / gameConstants.gameDimensions.height,
        ])
        const flapThreshold = 0.5
        return output[0] > flapThreshold
    }
}
