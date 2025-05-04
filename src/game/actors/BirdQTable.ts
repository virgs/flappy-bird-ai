import { QTableHandler } from '../../ai/q-table/QTableHandler'
import { QTableBirdSettings } from '../../settings/BirdSettings'
import { Bird, BirdProps, Commands } from './Birds'

export enum Action {
    FLAP = 'FLAP',
    DO_NOT_FLAP = 'DO_NOT_FLAP',
}

export type State = {
    horizontalDistanceToGap: number
    verticalDistanceToGap: number
    verticalDistanceToCeiling: number
}

//https://levelup.gitconnected.com/introduction-to-reinforcement-learning-and-q-learning-with-flappy-bird-aa1f40614532
export class BirdQTable extends Bird {
    private readonly qTableHandler: QTableHandler
    private readonly qTableBirdSettings: QTableBirdSettings
    private lastState?: State = undefined
    private currentState?: State = undefined
    private lastAction: Action = Action.DO_NOT_FLAP

    private counterMs = 0

    public constructor(options: BirdProps & { qTableBirdSettings: QTableBirdSettings }) {
        super(options)
        this.qTableBirdSettings = options.qTableBirdSettings
        this.qTableHandler = new QTableHandler(this.qTableBirdSettings)
    }

    protected childProcessInput(data: {
        verticalPosition: number
        closestPipeGapVerticalPosition: number
        horizontalDistanceToClosestPipe: number
        delta: number
    }): boolean {
        this.counterMs += data.delta
        if (this.counterMs < this.qTableBirdSettings.timeGridInMs.value) {
            return false
        }
        this.counterMs = 0

        this.currentState = this.qTableHandler.getState(
            data.horizontalDistanceToClosestPipe,
            data.closestPipeGapVerticalPosition - data.verticalPosition,
            data.verticalPosition
        )
        if (!this.lastState) {
            this.lastState = this.currentState
            return false
        }

        const stateChanged =
            this.lastState.horizontalDistanceToGap !== this.currentState.horizontalDistanceToGap ||
            this.lastState.verticalDistanceToGap !== this.currentState.verticalDistanceToGap ||
            this.lastState.verticalDistanceToCeiling !== this.currentState.verticalDistanceToCeiling
        if (stateChanged) {
            this.qTableHandler.updateQValue({
                currentState: this.currentState,
                lastState: this.lastState,
                reward: this.qTableBirdSettings.reward.stayAlive.value,
                lastAction: this.lastAction,
            })
            const shouldFlap = this.shouldFlap()
            this.lastState = this.currentState
            return shouldFlap
        }
        this.lastState = this.currentState
        return false
    }

    protected onBirdDeath(): void {
        if (this.lastState) {
            this.qTableHandler.updateQValue({
                currentState: this.currentState!,
                lastState: this.lastState,
                reward: this.qTableBirdSettings.reward.die.value,
                lastAction: this.lastAction,
            })
        }
        return super.onBirdDeath()
    }

    private shouldFlap(): boolean {
        const qActions = this.qTableHandler.getQElement(this.currentState!)
        const flapChancesAreHigher = qActions[Action.FLAP] >= qActions[Action.DO_NOT_FLAP]

        if (flapChancesAreHigher) {
            this.commands.push(Commands.FLAP_WING)
            this.lastAction = Action.FLAP
            return true
        } else {
            this.lastAction = Action.DO_NOT_FLAP
            return false
        }
    }
}
