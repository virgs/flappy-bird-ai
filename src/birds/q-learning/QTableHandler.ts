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
    dead: boolean
    altitude: number
    verticalSpeed: number
}

export type QTuple = {
    actions: ActionValues
    visits: number
}

export type QTable = {
    [state: string]: QTuple
}

export class QTableHandler {
    private readonly settings: QLearningSettings
    private readonly table: QTable

    public constructor(settings: QLearningSettings) {
        this.settings = settings
        this.table = {}
    }

    public getState(data: UpdateData): State {
        const discreteAltitude = this.calculateDiscreteFlightAltitude(data)
        const discreteVerticalSpeed = this.calculateDiscreteVerticalSpeed(data)
        const state: State = {
            altitude: discreteAltitude,
            verticalSpeed: discreteVerticalSpeed,
            distanceToClosestObstacle: this.calculateDiscreteDistanceToClosestObstacle(data),
            dead: data.birdIsDead,
        }
        // console.log('State:', state)
        return state
    }

    private calculateDiscreteDistanceToClosestObstacle(
        data: UpdateData
    ): { horizontal: number; vertical: number } | undefined {
        const horizontalPartition =
            gameConstants.gameDimensions.width / this.settings.gridSpatialAbstraction.horizontal.value
        const verticalPartition =
            gameConstants.gameDimensions.height / this.settings.gridSpatialAbstraction.vertical.value

        if (data.closestObstacleGapPosition !== undefined) {
            const discreteHorizontalDistance = Math.floor(
                (data.closestObstacleGapPosition.x - data.position.x) / horizontalPartition
            )
            // Check if the bird is ahead of the obstacle
            if (discreteHorizontalDistance >= 0) {
                // Calculate the distance to the closest obstacle
                return {
                    horizontal: discreteHorizontalDistance,
                    vertical: Math.floor((data.closestObstacleGapPosition.y - data.position.y) / verticalPartition),
                }
            }
        }
    }

    private calculateDiscreteFlightAltitude(data: UpdateData): number {
        const verticalPartition =
            gameConstants.gameDimensions.height / this.settings.gridSpatialAbstraction.vertical.value
        return Math.floor(data.position.y / verticalPartition)
    }

    private calculateDiscreteVerticalSpeed(data: UpdateData): number {
        const range = gameConstants.birdAttributes.flapImpulse + gameConstants.birdAttributes.maxBirdVerticalSpeed
        const verticalPartition = range / this.settings.verticalVelocityDiscretization.value
        return Math.floor((data.verticalSpeed + gameConstants.birdAttributes.flapImpulse) / verticalPartition)
    }

    public getQTuple(state: State): QTuple {
        const index = this.getStateHash(state)
        if (!this.table[index]) {
            // this.table[index] = {
            //     [Actions.DO_NOT_FLAP]: -0.01,
            //     [Actions.FLAP]: -0.01,
            // }
            this.table[index] = {
                actions: {
                    [Actions.DO_NOT_FLAP]: Math.random() * 0.01,
                    [Actions.FLAP]: Math.random() * 0.01,
                },
                visits: 1,
            }
            // this.table[index] = {
            //     actions: {
            //         [Actions.DO_NOT_FLAP]: 0,
            //         [Actions.FLAP]: 0,
            //     },
            //     visits: 1,
            // }
        } else {
            this.table[index].visits += 1
        }
        return this.table[index]
    }

    public getStateHash(state: State) {
        const distanceToClosestObstacle =
            `${state.distanceToClosestObstacle?.horizontal ?? '-'}` +
            `|${state.distanceToClosestObstacle?.vertical ?? '-'}|`
        const distanceToCeiling = `${state.altitude}|${state.verticalSpeed}`
        return distanceToClosestObstacle + distanceToCeiling + `|${state.dead}`
    }

    public updateQValue(data: { currentState: State; lastState: State; reward: number; lastAction: Actions }) {
        // https://github.com/yashkotadia/FlapPy-Bird-RL-Q-Learning-Bot
        // https://levelup.gitconnected.com/introduction-to-reinforcement-learning-and-q-learning-with-flappy-bird-aa1f40614532
        // Q[s,a] ←(1-α) Q[s,a] + α(r+ γmaxa' Q[s',a']).
        // https://repositorio.ufu.br/bitstream/123456789/22184/3/MetodosInteligenciaArtificial.pdf
        //     //new_q = (1 - LEARNING_RATE) * current_q + LEARNING_RATE * (reward + DISCOUNT * max_future_q)
        const futureQTuple = this.getQTuple(data.currentState)

        const estimateMaxQValue = Math.max(
            futureQTuple.actions[Actions.FLAP],
            futureQTuple.actions[Actions.DO_NOT_FLAP]
        )
        const lastActionValue = this.getQTuple(data.lastState).actions[data.lastAction]

        this.getQTuple(data.lastState).actions[data.lastAction] =
            (1 - this.settings.learningRate.value) * lastActionValue +
            this.settings.learningRate.value * (data.reward + this.settings.discountFactor.value * estimateMaxQValue)
    }
}
