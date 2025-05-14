import { Geom } from 'phaser'
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
            closestObstacleGapPosition: this.calculateDiscreteClosestObstacleGapPosition(data),
            alive: data.alive,
        }
        return state
    }

    private calculateDiscreteClosestObstacleGapPosition(data: UpdateData): Geom.Point | undefined {
        const verticalPartition =
            gameConstants.gameDimensions.height / this.settings.gridSpatialAbstraction.vertical.value

        if (data.closestObstacleGapPosition !== undefined) {
            // Calculate difference between obstacle and bird position
            const horizontalDifference = data.closestObstacleGapPosition.x - data.position.x

            // Use exponential scaling for non-linear discretization
            // This gives finer granularity when difference is closer to 0
            const sign = Math.sign(horizontalDifference)
            const absoluteDifference = Math.abs(horizontalDifference)
            const maxDistance = gameConstants.gameDimensions.width
            const normalizedValue = Math.min(absoluteDifference / maxDistance, 1) // 0 to 1

            // Apply non-linear transformation (more granular near 0)
            const scaledValue = Math.pow(normalizedValue, 0.5) // Square root for non-linear scaling

            // Discretize based on settings
            const discreteSteps = this.settings.gridSpatialAbstraction.horizontal.value
            const x = Math.floor(scaledValue * discreteSteps) * sign
            const y = Math.floor(data.closestObstacleGapPosition.y / verticalPartition)

            return new Geom.Point(x, y)
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
                visits: 0,
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
