import { UpdateData } from '../../game/actors/BirdSoul'
import { QLearningSettings } from '../../settings/BirdSettings'

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
    distanceToCeiling: number
}

export type QTable = { [state: string]: ActionValues }

export class QTableHandler {
    private readonly settings: QLearningSettings
    private readonly table: QTable

    public constructor(settings: QLearningSettings) {
        this.settings = settings
        this.table = settings.qTable || {}
    }

    public getState(data: UpdateData): State {
        const state: State = {
            distanceToCeiling: Math.floor(data.verticalPosition / this.settings.gridSpatialAbstraction.vertical.value),
        }
        if (data.closestPipeGapVerticalPosition !== undefined && data.horizontalDistanceToClosestPipe !== undefined) {
            // Calculate the distance to the closest obstacle
            state.distanceToClosestObstacle = {
                horizontal: Math.floor(
                    data.horizontalDistanceToClosestPipe / this.settings.gridSpatialAbstraction.horizontal.value
                ),
                vertical: Math.floor(
                    data.closestPipeGapVerticalPosition -
                        data.verticalPosition / this.settings.gridSpatialAbstraction.vertical.value
                ),
            }
        }
        return state
    }

    public getQElement(state: State): ActionValues {
        const index = this.getStateHash(state)
        if (!this.table[index]) {
            const indexes = this.createIndexesCloseToState(state)
            const reduced = indexes.reduce(
                (acc, item) => {
                    const value = this.table[item.index]
                    if (value) {
                        acc.counter += item.importance
                        acc.sum[Actions.DO_NOT_FLAP] += value[Actions.DO_NOT_FLAP] * item.importance
                        acc.sum[Actions.FLAP] += value[Actions.FLAP] * item.importance
                    }
                    return acc
                },
                {
                    counter: 0,
                    sum: {
                        [Actions.DO_NOT_FLAP]: 0,
                        [Actions.FLAP]: 0,
                    } as ActionValues,
                }
            )

            this.table[index] = {
                [Actions.DO_NOT_FLAP]: reduced.counter > 0 ? reduced.sum[Actions.DO_NOT_FLAP] / reduced.counter : 0,
                [Actions.FLAP]: reduced.counter > 0 ? reduced.sum[Actions.FLAP] / reduced.counter : 0,
            }
        }
        return this.table[index]
    }

    public getStateHash(state: State) {
        return `${state.distanceToClosestObstacle?.horizontal ?? '-'}|${state.distanceToClosestObstacle?.vertical ?? '-'}|${state.distanceToCeiling}`
    }

    private createIndexesCloseToState(state: State) {
        const indexes: { importance: number; index: string }[] = []
        for (let first = -1; first < 2; ++first) {
            for (let second = -1; second < 2; ++second) {
                for (let third = -1; third < 2; ++third) {
                    const importance = 1
                    indexes.push({
                        importance,
                        index: this.getStateHash(state),
                    })
                }
            }
        }
        return indexes
    }

    public updateQValue(data: { currentState: State; lastState: State; reward: number; lastAction: Actions }) {
        //https://github.com/yashkotadia/FlapPy-Bird-RL-Q-Learning-Bot
        //https://levelup.gitconnected.com/introduction-to-reinforcement-learning-and-q-learning-with-flappy-bird-aa1f40614532
        //Q[s,a] ←(1-α) Q[s,a] + α(r+ γmaxa' Q[s',a']).
        //https://repositorio.ufu.br/bitstream/123456789/22184/3/MetodosInteligenciaArtificial.pdf
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
