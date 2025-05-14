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
        x: number
        y: number
    }
    alive: boolean
    altitude: number
    verticalSpeed: number
}

export type QTuple = {
    actions: ActionValues
}

export type QTable = {
    [state: string]: QTuple
}

export class QTableHandler {
    private readonly settings: QLearningSettings
    public readonly table: QTable
    public readonly states: { [propname: string]: Set<number> } = {}

    public constructor(settings: QLearningSettings) {
        this.settings = settings
        this.table = {}
    }

    public getState(data: UpdateData): State {
        const discreteAltitude = this.calculateDiscreteFlightAltitude(data)
        this.states['altitude']
            ? this.states['altitude'].add(discreteAltitude)
            : (this.states['altitude'] = new Set([discreteAltitude]))
        const discreteVerticalSpeed = this.calculateDiscreteVerticalSpeed(data)
        this.states['verticalSpeed']
            ? this.states['verticalSpeed'].add(discreteVerticalSpeed)
            : (this.states['verticalSpeed'] = new Set([discreteVerticalSpeed]))
        const state: State = {
            altitude: discreteAltitude,
            verticalSpeed: discreteVerticalSpeed,
            closestObstacleGapPosition: this.calculateDiscreteClosestObstacleGapPosition(data),
            alive: data.alive,
        }
        return state
    }

    private calculateDiscreteClosestObstacleGapPosition(data: UpdateData):
        | {
              x: number
              y: number
          }
        | undefined {
        const horizontalPartition =
            gameConstants.gameDimensions.width / this.settings.gridSpatialAbstraction.horizontal.value
        const verticalPartition =
            gameConstants.gameDimensions.height / this.settings.gridSpatialAbstraction.vertical.value

        if (data.closestObstacleGapPosition !== undefined) {
            const x = Math.floor(data.closestObstacleGapPosition.x / horizontalPartition)
            const y = Math.floor(data.closestObstacleGapPosition.y / verticalPartition)
            this.states['obstacleX'] ? this.states['obstacleX'].add(x) : (this.states['obstacleX'] = new Set([x]))
            this.states['obstacleY'] ? this.states['obstacleY'].add(y) : (this.states['obstacleY'] = new Set([y]))

            return {
                x: x,
                y: y,
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
            `${state.closestObstacleGapPosition?.x ?? '-'}` + `|${state.closestObstacleGapPosition?.y ?? '-'}|`
        const distanceToCeiling = `${state.altitude}|${state.verticalSpeed}`
        const hash = distanceToClosestObstacle + distanceToCeiling + `|${state.alive}`
        if (!this.table[hash]) {
            this.table[hash] = {
                actions: {
                    [Actions.DO_NOT_FLAP]: 0,
                    [Actions.FLAP]: 0,
                },
            }
        }
        return hash
    }

    public updateQValue(data: { nextState: State; currentState: State; reward: number; action: Actions }) {
        // https://github.com/yashkotadia/FlapPy-Bird-RL-Q-Learning-Bot
        // https://levelup.gitconnected.com/introduction-to-reinforcement-learning-and-q-learning-with-flappy-bird-aa1f40614532
        // Q[s,a] ←(1-α) Q[s,a] + α(r+ γmaxa' Q[s',a']).
        // https://repositorio.ufu.br/bitstream/123456789/22184/3/MetodosInteligenciaArtificial.pdf
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
    }
}
