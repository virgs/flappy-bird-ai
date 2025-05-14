import { BirdProps, BirdPropsFixture, UpdateData } from '../../game/actors/BirdProps'
import { QLearningRewards, QLearningSettings } from './QLearningSettings'
import { Actions, QTableHandler, State } from './QTableHandler'

type QLearningBirdProps = BirdPropsFixture & {
    settings: QLearningSettings
    episode: number
    rewards: QLearningRewards
    qTableHandler: QTableHandler
}

export enum Rewards {
    HIT_CEILING = 'hitCeiling',
    HIT_BOTTOM_PIPE = 'hitBottomPipe',
    HIT_TOP_PIPE = 'hitTopPipe',
    HIT_FLOOR = 'hitFloor',
    PASSED_PIPE = 'passedPipe',
    MILLISECONDS_ALIVE = 'millisecondsAlive',
}

export type Move = {
    state: string
    nextState: string
    action: Actions
    reward: Rewards
}

//https://levelup.gitconnected.com/introduction-to-reinforcement-learning-and-q-learning-with-flappy-bird-aa1f40614532
export class QLearningBird extends BirdProps {
    private readonly _props: QLearningBirdProps
    private readonly qTableHandler: QTableHandler
    private readonly explorationRate: number
    private alive: boolean = true
    private reward?: Rewards
    private action: Actions = Actions.DO_NOT_FLAP
    private currentState?: State = undefined
    public moves: Move[] = []

    public constructor(options: QLearningBirdProps) {
        super()
        this._props = options
        this.qTableHandler = options.qTableHandler
        this.explorationRate = options.settings.explorationRate.value
        this.reward = Rewards.MILLISECONDS_ALIVE
        this.action = Actions.DO_NOT_FLAP
        this.explorationRate = Math.max(
            0.001,
            options.settings.explorationRate.value - options.settings.explorationRateDecay.value * options.episode
        )
    }

    public override getFixture(): QLearningBirdProps {
        return this._props
    }

    public override update(data: UpdateData): void {
        const nextState = this.qTableHandler.getState(data)

        if (this.currentState && this.alive) {
            const stateChanged =
                this.qTableHandler.getStateHash(nextState) !== this.qTableHandler.getStateHash(this.currentState)
            if (
                [Rewards.HIT_BOTTOM_PIPE, Rewards.HIT_TOP_PIPE, Rewards.HIT_CEILING, Rewards.HIT_FLOOR].includes(
                    this.reward!
                )
            ) {
                this.alive = false
            }
            if (stateChanged || !this.alive) {
                this.moves.push({
                    state: this.qTableHandler.getStateHash(this.currentState),
                    action: this.action,
                    reward: this.reward!,
                    nextState: this.qTableHandler.getStateHash(nextState),
                })
                // Reset values
                this.reward = Rewards.MILLISECONDS_ALIVE
                this.action = Actions.DO_NOT_FLAP
            }
        }
        this.currentState = nextState
    }

    public override onPassedPipe(): void {
        this.reward = Rewards.PASSED_PIPE
    }

    public override onHitFloor(): void {
        this.reward = Rewards.HIT_FLOOR
    }

    public override onHitCeiling(): void {
        this.reward = Rewards.HIT_CEILING
    }

    public override onHitTopPipeObstacle(): void {
        this.reward = Rewards.HIT_TOP_PIPE
    }

    public override onHitBottomPipeObstacle(): void {
        this.reward = Rewards.HIT_BOTTOM_PIPE
    }

    public override shouldFlap(): boolean {
        if (Math.random() < this.explorationRate || !this.currentState) {
            this.action = Math.random() < 0.5 ? Actions.FLAP : Actions.DO_NOT_FLAP
            return this.action === Actions.FLAP
        }

        const qTuple = this.qTableHandler.getQTuple(this.currentState)
        const flapChancesAreHigher = qTuple.actions[Actions.FLAP] > qTuple.actions[Actions.DO_NOT_FLAP]

        if (flapChancesAreHigher) {
            this.action = Actions.FLAP
            return true
        } else {
            this.action = Actions.DO_NOT_FLAP
            return false
        }
    }
}
