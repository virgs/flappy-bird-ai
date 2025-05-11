import { BirdProps, BirdPropsFixture, UpdateData } from '../../game/actors/BirdProps'
import { QLearningRewards } from './QLearningSettings'
import { Actions, QTableHandler, State } from './QTableHandler'

type QLearningBirdProps = BirdPropsFixture & {
    rewards: QLearningRewards
    qTableHandler: QTableHandler
}

//https://levelup.gitconnected.com/introduction-to-reinforcement-learning-and-q-learning-with-flappy-bird-aa1f40614532
export class QLearningBird extends BirdProps {
    private readonly _props: QLearningBirdProps
    private readonly qTableHandler: QTableHandler
    private readonly rewards: QLearningRewards
    private lastState?: State = undefined
    private currentState?: State = undefined
    private lastAction: Actions = Actions.DO_NOT_FLAP
    private ellapsedTimeMs: number = 0

    public constructor(options: QLearningBirdProps) {
        super()
        this._props = options
        this.rewards = options.rewards
        this.qTableHandler = options.qTableHandler
    }

    public override getFixture(): QLearningBirdProps {
        return this._props
    }

    public override update(data: UpdateData): void {
        this.ellapsedTimeMs += data.delta
        this.currentState = this.qTableHandler.getState(data)
        if (!this.lastState) {
            this.lastState = this.currentState
            return
        }

        const stateChanged =
            this.qTableHandler.getStateHash(this.currentState) !== this.qTableHandler.getStateHash(this.lastState)
        if (stateChanged) {
            this.qTableHandler.updateQValue({
                currentState: this.currentState,
                lastState: this.lastState,
                reward: this.rewards.secondsAlive.value * (this.ellapsedTimeMs / 1000),
                lastAction: this.lastAction,
            })
            this.lastState = this.currentState
            this.ellapsedTimeMs = 0
        }
        this.lastState = this.currentState
    }

    public override onPassedPipe(): void {
        if (this.lastState) {
            this.qTableHandler.updateQValue({
                currentState: this.currentState!,
                lastState: this.lastState,
                reward: this.rewards.passedPipe.value,
                lastAction: this.lastAction,
            })
        }
    }

    public override onHitFloor(): void {
        if (this.lastState) {
            this.qTableHandler.updateQValue({
                currentState: this.currentState!,
                lastState: this.lastState,
                reward: this.rewards.hitFloor.value,
                lastAction: this.lastAction,
            })
        }
    }

    public override onHitCeiling(): void {
        if (this.lastState) {
            this.qTableHandler.updateQValue({
                currentState: this.currentState!,
                lastState: this.lastState,
                reward: this.rewards.hitCeiling.value,
                lastAction: this.lastAction,
            })
        }
    }

    public override onHitTopPipeObstacle(): void {
        if (this.lastState) {
            this.qTableHandler.updateQValue({
                currentState: this.currentState!,
                lastState: this.lastState,
                reward: this.rewards.hitTopPipe.value,
                lastAction: this.lastAction,
            })
        }
    }

    public override onHitBottomPipeObstacle(): void {
        if (this.lastState) {
            this.qTableHandler.updateQValue({
                currentState: this.currentState!,
                lastState: this.lastState,
                reward: this.rewards.hitBottomPipe.value,
                lastAction: this.lastAction,
            })
        }
    }

    public override shouldFlap(): boolean {
        const qTuple = this.qTableHandler.getQTuple(this.currentState!)
        const epsilon = 1 / (qTuple.visits + 1)

        if (Math.random() < epsilon) {
            this.lastAction = Math.random() < 0.5 ? Actions.FLAP : Actions.DO_NOT_FLAP
            return this.lastAction === Actions.FLAP
        }

        const flapChancesAreHigher = qTuple.actions[Actions.FLAP] > qTuple.actions[Actions.DO_NOT_FLAP]

        if (flapChancesAreHigher) {
            this.lastAction = Actions.FLAP
            return true
        } else {
            this.lastAction = Actions.DO_NOT_FLAP
            return false
        }
    }
}
