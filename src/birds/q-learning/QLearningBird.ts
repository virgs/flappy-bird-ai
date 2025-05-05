import { Actions, QTableHandler, State } from './QTableHandler'
import { QLearningRewards } from '../../settings/BirdSettings'
import { BirdSoul, BirdSoulProps, UpdateData } from '../../game/actors/BirdSoul'

//https://levelup.gitconnected.com/introduction-to-reinforcement-learning-and-q-learning-with-flappy-bird-aa1f40614532
export class QLearningBird extends BirdSoul {
    private readonly qTableHandler: QTableHandler
    private readonly rewards: QLearningRewards
    private lastState?: State = undefined
    private currentState?: State = undefined
    private lastAction: Actions = Actions.DO_NOT_FLAP

    // private counterMs = 0

    public constructor(options: BirdSoulProps & { rewards: QLearningRewards; qTableHandler: QTableHandler }) {
        super(options)
        this.rewards = options.rewards
        this.qTableHandler = options.qTableHandler
    }

    public update(data: UpdateData): void {
        // this.counterMs += data.delta
        // if (this.counterMs < this.qLearningSettings.timeGridInMs.value) {
        //     return false
        // }
        // this.counterMs = 0

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
                reward: this.rewards.stayAlive.value,
                lastAction: this.lastAction,
            })
            this.lastState = this.currentState
        }
        this.lastState = this.currentState
    }

    public onPassedPipe(): void {
        if (this.lastState) {
            this.qTableHandler.updateQValue({
                currentState: this.currentState!,
                lastState: this.lastState,
                reward: this.rewards.passedPipe.value,
                lastAction: this.lastAction,
            })
        }
    }

    public onDeath(): void {
        if (this.lastState) {
            this.qTableHandler.updateQValue({
                currentState: this.currentState!,
                lastState: this.lastState,
                reward: this.rewards.die.value,
                lastAction: this.lastAction,
            })
        }
    }

    public shouldFlap(): boolean {
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
