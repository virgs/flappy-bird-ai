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
        // When there is no obstacle, the gap position is set to a non-existent position
        // to avoid NaN errors in the ANN
        const nonExistentObstacleModifier = 20
        const closestObstacleGapPosition = this.lastUpdateData.closestObstacleGapPosition
            ? this.lastUpdateData.closestObstacleGapPosition
            : {
                  x: nonExistentObstacleModifier * gameConstants.gameDimensions.width,
                  y: nonExistentObstacleModifier * gameConstants.gameDimensions.height,
              }
        const data = this.lastUpdateData
        const output = this.ann.process([
            data.position.y / gameConstants.gameDimensions.height,
            data.verticalSpeed / gameConstants.birdAttributes.maxBirdVerticalSpeed,
            (closestObstacleGapPosition.x - data.position.x) / gameConstants.gameDimensions.width,
            (closestObstacleGapPosition.y - data.position.y) / gameConstants.gameDimensions.height,
        ])
        return output[0] > 0.5
    }
}
