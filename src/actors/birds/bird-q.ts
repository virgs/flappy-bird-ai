import {Bird, BirdType, Commands} from './bird';
import {scale} from '../../scale';

enum Action {
    FLAP = 'FLAP',
    DO_NOT_FLAP = 'DO_NOT_FLAP'
}

type State = {
    horizontalDistanceToGap: number,
    verticalDistanceToGap: number,
    verticalDistanceToCeiling: number
};

enum Rewards {
    die = -100000,
    // passThroughPipeGap = 10,
    stayAlive = 10
}

type ActionValues = {
    [Action.FLAP]: number,
    [Action.DO_NOT_FLAP]: number,
};

//https://levelup.gitconnected.com/introduction-to-reinforcement-learning-and-q-learning-with-flappy-bird-aa1f40614532
export class BirdQ extends Bird {

    //The learning rate controls how quickly the model is adapted to the problem, and is often in the range between 0.0 and 1.0.
    private static readonly learningRate: number = 0.35;

    //The discount factor is a measure of how much we want to care about future rewards rather than immediate rewards.
    //It is usually fairly high (because we put greater importance on long term gains) and between 0 and 1.
    private static readonly discountFactor: number = 0.8;

    private static readonly pixelGridSpatialAbstraction = 5;

    private static qTable: {
        [state: string]: ActionValues
    } = {};

    private lastState: State | undefined = undefined;
    private currentState: State | undefined = undefined;
    private lastAction: Action = Action.DO_NOT_FLAP;

    private counterMs = 0;

    public constructor(options: { initialPosition: Phaser.Geom.Point, scene: Phaser.Scene, id: number }) {
        super(options, BirdType.Q_TABLE);
    }

    protected handleBirdInput(data: {
        verticalPosition: number,
        closestPipeGapVerticalPosition: number,
        horizontalDistanceToClosestPipe: number,
        delta: number
    }): boolean {
        this.counterMs += data.delta;
        if (this.counterMs < 200) {
            return false;
        }
        this.counterMs = 0;

        const denominator = BirdQ.pixelGridSpatialAbstraction * scale;
        this.currentState = {
            horizontalDistanceToGap: Math.floor(data.horizontalDistanceToClosestPipe / denominator),
            verticalDistanceToGap: Math.floor((data.closestPipeGapVerticalPosition - data.verticalPosition) / denominator),
            verticalDistanceToCeiling: Math.floor(data.verticalPosition / denominator)
        };
        if (!this.lastState) {
            this.lastState = this.currentState;
            return false;
        }

        const stateChanged = this.lastState.horizontalDistanceToGap !== this.currentState.horizontalDistanceToGap ||
            this.lastState.verticalDistanceToGap !== this.currentState.verticalDistanceToGap ||
            this.lastState.verticalDistanceToCeiling !== this.currentState.verticalDistanceToCeiling;
        if (stateChanged) {
            this.updateQValue(Rewards.stayAlive);
            const shouldFlap = this.shouldFlap();
            this.lastState = this.currentState;
            return shouldFlap;
        }
        this.lastState = this.currentState;
        return false;

    }

    protected onBirdDeath(): any {
        if (this.lastState) {
            this.updateQValue(Rewards.die);
        }
        return super.onBirdDeath();
    }

    private shouldFlap(): boolean {
        const qActions = BirdQ.getQElement(this.currentState);
        const flapChancesAreHigher = qActions[Action.FLAP] > qActions[Action.DO_NOT_FLAP];

        if (flapChancesAreHigher) {
            this.commands.push(Commands.FLAP_WING);
            this.lastAction = Action.FLAP;
            return true;
        } else {
            this.lastAction = Action.DO_NOT_FLAP;
            return false;
        }
    }

    private updateQValue(reward: Rewards) {
        //https://github.com/yashkotadia/FlapPy-Bird-RL-Q-Learning-Bot
        //https://levelup.gitconnected.com/introduction-to-reinforcement-learning-and-q-learning-with-flappy-bird-aa1f40614532
        //Q[s,a] ←(1-α) Q[s,a] + α(r+ γmaxa' Q[s',a']).
        //https://repositorio.ufu.br/bitstream/123456789/22184/3/MetodosInteligenciaArtificial.pdf
        //     //new_q = (1 - LEARNING_RATE) * current_q + LEARNING_RATE * (reward + DISCOUNT * max_future_q)

        const futureQActions = BirdQ.getQElement(this.currentState);

        const estimateMaxQValue = Math.max(futureQActions[Action.FLAP], futureQActions[Action.DO_NOT_FLAP]);
        BirdQ.getQElement(this.lastState)[this.lastAction] +=
            BirdQ.learningRate * (reward + BirdQ.discountFactor * estimateMaxQValue - BirdQ.getQElement(this.lastState)[this.lastAction]);
    }

    private static getQElement(state: State): ActionValues {
        const index = `${state.horizontalDistanceToGap}|${state.verticalDistanceToGap}|${state.verticalDistanceToCeiling}`;
        if (!BirdQ.qTable[index]) {
            const indexes = this.createIndexesCloseToState(state);
            const average = indexes.reduce((acc, item) => {
                    const value = BirdQ.qTable[item.index];
                    if (value) {
                        acc.counter += item.importance;
                        acc.sum[Action.DO_NOT_FLAP] += value[Action.DO_NOT_FLAP] * item.importance;
                        acc.sum[Action.FLAP] += value[Action.FLAP] * item.importance;
                    }
                    return acc;
                },
                {
                    counter: 0,
                    sum: {
                        [Action.DO_NOT_FLAP]: 0,
                        [Action.FLAP]: 0
                    } as ActionValues
                }
            );

            BirdQ.qTable[index] = {
                [Action.DO_NOT_FLAP]: average.counter > 0 ? average.sum[Action.DO_NOT_FLAP] / average.counter : 0,
                [Action.FLAP]: average.counter > 0 ? average.sum[Action.FLAP] / average.counter : 0,
            };
        }
        return BirdQ.qTable[index];
    }

    private static createIndexesCloseToState(state: State) {
        const indexes: { importance: number, index: string }[] = [];
        for (let first = -1; first < 2; ++first) {
            for (let second = -1; second < 2; ++second) {
                for (let third = -1; third < 2; ++third) {
                    const importance = 1;
                    indexes.push({
                        importance,
                        index: `${state.horizontalDistanceToGap + first}|${state.verticalDistanceToGap + second}|${state.verticalDistanceToCeiling + third}`
                    });
                }
            }
        }
        return indexes;
    }
}
