import { UpdateData } from '../../game/actors/BirdProps'
import { gameConstants } from '../../game/GameConstants'
import { QLearningSettings } from './QLearningSettings'

export enum Actions {
    FLAP = 'FLAP',
    DO_NOT_FLAP = 'DO_NOT_FLAP',
}

export type ActionValues = {
    [Actions.FLAP]: number
    [Actions.DO_NOT_FLAP]: number
}

export type State = {
    distanceToClosestObstacle?: {
        horizontal: number
        vertical: number
    }
    distanceToCeiling: string
    verticalSpeed: number
}

export type QTable = { [state: string]: ActionValues }

export class QTableHandler {
    private readonly settings: QLearningSettings
    private readonly table: QTable

    public constructor(settings: QLearningSettings) {
        this.settings = settings
        this.table = {}
    }

    public getState(data: UpdateData): State {
        const horizontalPartition =
            gameConstants.gameDimensions.width / this.settings.gridSpatialAbstraction.horizontal.value
        const verticalPartition =
            gameConstants.gameDimensions.height / this.settings.gridSpatialAbstraction.vertical.value
        const distanceToCeiling = Math.floor(data.position.y / verticalPartition)
        let verticalSpeedState = 0
        if (Math.abs(data.verticalSpeed) > gameConstants.birdAttributes.maxBirdVerticalSpeed / 2) {
            verticalSpeedState = data.verticalSpeed > 0 ? 1 : -1
        }
        const state: State = {
            distanceToCeiling:
                distanceToCeiling < 2
                    ? 'high'
                    : distanceToCeiling > this.settings.gridSpatialAbstraction.horizontal.value - 2
                      ? 'low'
                      : '-',
            verticalSpeed: verticalSpeedState,
        }
        if (data.closestObstacleGapPosition !== undefined) {
            const horizontalValue = Math.floor(
                (data.closestObstacleGapPosition.x - data.position.x) / horizontalPartition
            )
            // Check if the bird is close to the obstacle, otherwise ignore it
            if (horizontalValue < this.settings.gridSpatialAbstraction.horizontal.value / 2) {
                // Calculate the distance to the closest obstacle
                state.distanceToClosestObstacle = {
                    horizontal: horizontalValue,
                    vertical: Math.floor((data.closestObstacleGapPosition.y - data.position.y) / verticalPartition),
                }
            }
        }
        return state
    }

    public getQElement(state: State): ActionValues {
        const index = this.getStateHash(state)
        if (!this.table[index]) {
            // this.table[index] = {
            //     [Actions.DO_NOT_FLAP]: -0.01,
            //     [Actions.FLAP]: -0.01,
            // }
            // this.table[index] = {
            //     [Actions.DO_NOT_FLAP]: 1,
            //     [Actions.FLAP]: 1,
            // }
            this.table[index] = {
                [Actions.DO_NOT_FLAP]: 0,
                [Actions.FLAP]: 0,
            }
            // this.table[index] = {
            //     [Actions.DO_NOT_FLAP]: Math.random() * 0.1,
            //     [Actions.FLAP]: Math.random() * 0.05,
            // }
        }
        return this.table[index]
    }

    public getStateHash(state: State) {
        const distanceToClosestObstacle =
            `${state.distanceToClosestObstacle?.horizontal ?? '-'}` +
            `|${state.distanceToClosestObstacle?.vertical ?? '-'}|`
        const distanceToCeiling = `${state.distanceToCeiling}|${state.verticalSpeed}`
        return distanceToClosestObstacle + distanceToCeiling
    }

    public updateQValue(data: { currentState: State; lastState: State; reward: number; lastAction: Actions }) {
        // https://github.com/yashkotadia/FlapPy-Bird-RL-Q-Learning-Bot
        // https://levelup.gitconnected.com/introduction-to-reinforcement-learning-and-q-learning-with-flappy-bird-aa1f40614532
        // Q[s,a] ←(1-α) Q[s,a] + α(r+ γmaxa' Q[s',a']).
        // https://repositorio.ufu.br/bitstream/123456789/22184/3/MetodosInteligenciaArtificial.pdf
        //     //new_q = (1 - LEARNING_RATE) * current_q + LEARNING_RATE * (reward + DISCOUNT * max_future_q)
        const futureQActions = this.getQElement(data.currentState)

        const estimateMaxQValue = Math.max(futureQActions[Actions.FLAP], futureQActions[Actions.DO_NOT_FLAP])
        this.getQElement(data.lastState)[data.lastAction] +=
            this.settings.learningRate.value *
            (data.reward +
                this.settings.discountFactor.value * estimateMaxQValue -
                this.getQElement(data.lastState)[data.lastAction])
    }
}
