import { Action, State } from '../../game/actors/BirdQTable'
import { QTableBirdSettings, Range } from '../../settings/BirdSettings'

export type ActionValues = {
    [Action.FLAP]: number
    [Action.DO_NOT_FLAP]: number
}

export type QTable = { [state: string]: ActionValues }

export class QTableHandler {
    private readonly learningRate: number
    private readonly discountFactor: number
    private readonly table: QTable
    private readonly gridSpatialAbstraction: {
        horizontal: Range
        vertical: Range
    }

    public constructor(settings: QTableBirdSettings) {
        this.learningRate = settings.learningRate.value
        this.discountFactor = settings.discountFactor.value
        this.gridSpatialAbstraction = settings.gridSpatialAbstraction
        this.table = settings.qTable || {}
    }

    public getState(
        horizontalDistanceToGap: number,
        verticalDistanceToGap: number,
        verticalDistanceToCeiling: number
    ): State {
        return {
            horizontalDistanceToGap: Math.floor(horizontalDistanceToGap / this.gridSpatialAbstraction.horizontal.value),
            verticalDistanceToGap: Math.floor(verticalDistanceToGap / this.gridSpatialAbstraction.vertical.value),
            verticalDistanceToCeiling: Math.floor(
                verticalDistanceToCeiling / this.gridSpatialAbstraction.vertical.value
            ),
        }
    }

    public getQElement(state: State): ActionValues {
        const index = `${state.horizontalDistanceToGap}|${state.verticalDistanceToGap}|${state.verticalDistanceToCeiling}`
        if (!this.table[index]) {
            const indexes = this.createIndexesCloseToState(state)
            const average = indexes.reduce(
                (acc, item) => {
                    const value = this.table[item.index]
                    if (value) {
                        acc.counter += item.importance
                        acc.sum[Action.DO_NOT_FLAP] += value[Action.DO_NOT_FLAP] * item.importance
                        acc.sum[Action.FLAP] += value[Action.FLAP] * item.importance
                    }
                    return acc
                },
                {
                    counter: 0,
                    sum: {
                        [Action.DO_NOT_FLAP]: 0,
                        [Action.FLAP]: 0,
                    } as ActionValues,
                }
            )

            this.table[index] = {
                [Action.DO_NOT_FLAP]: average.counter > 0 ? average.sum[Action.DO_NOT_FLAP] / average.counter : 0,
                [Action.FLAP]: average.counter > 0 ? average.sum[Action.FLAP] / average.counter : 0,
            }
        }
        return this.table[index]
    }

    private createIndexesCloseToState(state: State) {
        const indexes: { importance: number; index: string }[] = []
        for (let first = -1; first < 2; ++first) {
            for (let second = -1; second < 2; ++second) {
                for (let third = -1; third < 2; ++third) {
                    const importance = 1
                    indexes.push({
                        importance,
                        index: `${state.horizontalDistanceToGap + first}|${state.verticalDistanceToGap + second}|${state.verticalDistanceToCeiling + third}`,
                    })
                }
            }
        }
        return indexes
    }

    public updateQValue(data: { currentState: State; lastState: State; reward: number; lastAction: Action }) {
        //https://github.com/yashkotadia/FlapPy-Bird-RL-Q-Learning-Bot
        //https://levelup.gitconnected.com/introduction-to-reinforcement-learning-and-q-learning-with-flappy-bird-aa1f40614532
        //Q[s,a] ←(1-α) Q[s,a] + α(r+ γmaxa' Q[s',a']).
        //https://repositorio.ufu.br/bitstream/123456789/22184/3/MetodosInteligenciaArtificial.pdf
        //     //new_q = (1 - LEARNING_RATE) * current_q + LEARNING_RATE * (reward + DISCOUNT * max_future_q)
        const futureQActions = this.getQElement(data.currentState)

        const estimateMaxQValue = Math.max(futureQActions[Action.FLAP], futureQActions[Action.DO_NOT_FLAP])
        this.getQElement(data.lastState)[data.lastAction] +=
            this.learningRate *
            (data.reward + this.discountFactor * estimateMaxQValue - this.getQElement(data.lastState)[data.lastAction])
    }
}
