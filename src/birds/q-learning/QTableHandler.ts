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
    closestObstacleGapPosition?: {
        horizontalDistanceToBird: number
        verticalDistanceToCeiling: number
    }
    alive: boolean
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
    public readonly table: QTable

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
            closestObstacleGapPosition: this.calculateDiscreteDistanceToClosestObstacle(data),
            alive: data.alive,
        }
        // console.log('State:', state)
        return state
    }

    private calculateDiscreteDistanceToClosestObstacle(data: UpdateData):
        | {
              horizontalDistanceToBird: number
              verticalDistanceToCeiling: number
          }
        | undefined {
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
                const newLocal = Math.floor(data.closestObstacleGapPosition.y / verticalPartition)
                // console.log(newLocal, gameConstants.obstacles.verticalOffset.total)
                // Calculate the distance to the closest obstacle
                return {
                    horizontalDistanceToBird: discreteHorizontalDistance,
                    verticalDistanceToCeiling: newLocal,
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
        return this.table[this.getStateHash(state)]
    }

    public getStateHash(state: State) {
        const distanceToClosestObstacle =
            `${state.closestObstacleGapPosition?.horizontalDistanceToBird ?? '-'}` +
            `|${state.closestObstacleGapPosition?.verticalDistanceToCeiling ?? '-'}|`
        const distanceToCeiling = `${state.altitude}|${state.verticalSpeed}`
        const hash = distanceToClosestObstacle + distanceToCeiling + `|${state.alive}`
        if (!this.table[hash]) {
            // this.table[index] = {
            //     [Actions.DO_NOT_FLAP]: -0.01,
            //     [Actions.FLAP]: -0.01,
            // }
            // this.table[hash] = {
            //     actions: {
            //         [Actions.DO_NOT_FLAP]: Math.random() * 0.01,
            //         [Actions.FLAP]: Math.random() * 0.01,
            //     },
            //     visits: 1,
            // }
            this.table[hash] = {
                actions: {
                    [Actions.DO_NOT_FLAP]: 0,
                    [Actions.FLAP]: 0,
                },
                visits: 1,
            }
            // this.table[index] = {
            //     actions: {
            //         [Actions.DO_NOT_FLAP]: 1,
            //         [Actions.FLAP]: 1,
            //     },
            //     visits: 1,
            // }
        }
        return hash
    }

    public updateQValue(data: { nextState: State; currentState: State; reward: number; action: Actions }) {
        // console.log('Update Q value', data.reward, JSON.stringify(data.nextState))
        // https://github.com/yashkotadia/FlapPy-Bird-RL-Q-Learning-Bot
        // https://levelup.gitconnected.com/introduction-to-reinforcement-learning-and-q-learning-with-flappy-bird-aa1f40614532
        // Q[s,a] ←(1-α) Q[s,a] + α(r+ γmaxa' Q[s',a']).
        // https://repositorio.ufu.br/bitstream/123456789/22184/3/MetodosInteligenciaArtificial.pdf
        //     //new_q = (1 - LEARNING_RATE) * current_q + LEARNING_RATE * (reward + DISCOUNT * max_future_q)
        const futureQTuple = this.getQTuple(data.nextState)

        const estimateMaxQValue = Math.max(
            futureQTuple.actions[Actions.FLAP],
            futureQTuple.actions[Actions.DO_NOT_FLAP]
        )
        const qTuple = this.getQTuple(data.currentState).actions[data.action]

        this.getQTuple(data.currentState).actions[data.action] =
            qTuple +
            this.settings.learningRate.value *
                (data.reward + this.settings.discountFactor.value * estimateMaxQValue - qTuple)

        // q_table[(state, action)] =
        //     q_table[(state, action)] + alpha * (reward + gamma * np.max(q_table[next_state]) - q_table[(state, action)])
    }
}
