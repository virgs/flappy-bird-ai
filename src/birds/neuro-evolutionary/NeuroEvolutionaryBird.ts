import { BirdSoul, BirdSoulProps, Commands, UpdateData } from '../../game/actors/BirdSoul'
import { gameConstants } from '../../game/GameConstants'
import { ArtificialNeuralNetwork, ArtificialNeuralNetworkConfig } from './ArtificialNeuralNetwork'

export type NeuroEvolutionayProps = BirdSoulProps & {
    annSettings: ArtificialNeuralNetworkConfig
}

export class NeuroEvolutionaryBird extends BirdSoul {
    private readonly _props: NeuroEvolutionayProps
    private readonly ann: ArtificialNeuralNetwork
    private lastUpdateData: UpdateData

    public constructor(options: NeuroEvolutionayProps) {
        super()
        this.ann = new ArtificialNeuralNetwork(options.annSettings)
        this._props = options
    }
    public getSoulProperties(): NeuroEvolutionayProps {
        return this._props
    }

    public update(data: UpdateData): void {
        this.lastUpdateData = data
    }

    public shouldFlap(): boolean {
        const data = this.lastUpdateData
        if (data.closestPipeGapVerticalPosition === undefined || data.horizontalDistanceToClosestPipe === undefined) {
            return false
        }

        const output = this.ann.process([
            data.verticalPosition / gameConstants.gameDimensions.height,
            data.verticalSpeed / gameConstants.birdAttributes.maxBirdVerticalSpeed,
            data.horizontalDistanceToClosestPipe / gameConstants.gameDimensions.width,
            data.closestPipeGapVerticalPosition / gameConstants.gameDimensions.height,
        ])
        return output[0] > 0.5
    }
}
