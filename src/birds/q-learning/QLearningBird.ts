import { Actions, QTableHandler, State } from './QTableHandler'
import { BirdSoul, BirdSoulProps, UpdateData } from '../../game/actors/BirdSoul'
import { QLearningRewards } from './QLearningSettings'

type QLearningBirdProps = BirdSoulProps & {
    rewards: QLearningRewards
    qTableHandler: QTableHandler
}

//https://levelup.gitconnected.com/introduction-to-reinforcement-learning-and-q-learning-with-flappy-bird-aa1f40614532
export class QLearningBird extends BirdSoul {
    private readonly _props: QLearningBirdProps
    private readonly qTableHandler: QTableHandler
    private readonly rewards: QLearningRewards
    // private epsilon = 0.1 // Adjust dynamically over time
    private lastState?: State = undefined
    private currentState?: State = undefined
    private lastAction: Actions = Actions.DO_NOT_FLAP
    // private ellapsedTime: number = 0

    public constructor(options: QLearningBirdProps) {
        super()
        this._props = options
        this.rewards = options.rewards
        this.qTableHandler = options.qTableHandler
    }

    public getSoulProperties(): QLearningBirdProps {
        return this._props
    }

    public update(data: UpdateData): void {
        // this.ellapsedTime += data.delta
        // if (this.ellapsedTime < 100) {
        //     return
        // }
        // this.ellapsedTime = 0

        this.currentState = this.qTableHandler.getState(data)
        if (!this.lastState) {
            this.lastState = this.currentState
            return
        }
        // this.epsilon = Math.max(0.01, this.epsilon - 0.0001 * data.roundIteration) // Decrease epsilon over time

        const stateChanged =
            this.qTableHandler.getStateHash(this.currentState) !== this.qTableHandler.getStateHash(this.lastState)
        if (stateChanged) {
            this.qTableHandler.updateQValue({
                currentState: this.currentState,
                lastState: this.lastState,
                reward: this.rewards.stayAlive.value,
                lastAction: this.lastAction,
            })
            this.lastState = this.currentState
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

    public onHitFloorOrCeiling(): void {
        if (this.lastState) {
            this.qTableHandler.updateQValue({
                currentState: this.currentState!,
                lastState: this.lastState,
                reward: this.rewards.hitFloorOrCeiling.value,
                lastAction: this.lastAction,
            })
        }
    }

    public onHitObstacle(): void {
        if (this.lastState) {
            this.qTableHandler.updateQValue({
                currentState: this.currentState!,
                lastState: this.lastState,
                reward: this.rewards.hitObstacle.value,
                lastAction: this.lastAction,
            })
        }
    }

    public shouldFlap(): boolean {
        // if (Math.random() < this.epsilon) {
        //     this.lastAction = Math.random() < 0.5 ? Actions.FLAP : Actions.DO_NOT_FLAP
        //     return this.lastAction === Actions.FLAP
        // }

        const qActions = this.qTableHandler.getQElement(this.currentState!)
        const flapChancesAreHigher = qActions[Actions.FLAP] > qActions[Actions.DO_NOT_FLAP]

        if (flapChancesAreHigher) {
            this.lastAction = Actions.FLAP
            return true
        } else {
            this.lastAction = Actions.DO_NOT_FLAP
            return false
        }
    }
}
