import { BirdProps, BirdPropsFixture, UpdateData } from '../../game/actors/BirdProps'
import { QLearningRewards, QLearningSettings } from './QLearningSettings'
import { Actions, QTableHandler, State } from './QTableHandler'
import { Range } from '../../settings/BirdSettings'

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

//https://levelup.gitconnected.com/introduction-to-reinforcement-learning-and-q-learning-with-flappy-bird-aa1f40614532
export class QLearningBird extends BirdProps {
    private readonly _props: QLearningBirdProps
    private readonly qTableHandler: QTableHandler
    private readonly rewardsValues: QLearningRewards
    private readonly explorationRate: number
    // private alive: boolean = true
    private alive: boolean = true
    private reward?: Rewards
    private action: Actions = Actions.DO_NOT_FLAP
    private currentState?: State = undefined
    // private nextState?: State = undefined
    // private action: Actions = Actions.DO_NOT_FLAP
    // private ellapsedTimeMs: number = 0
    public moves: {
        state: string
        nextState: string
        action: Actions
        reward: Rewards
    }[] = []

    public constructor(options: QLearningBirdProps) {
        super()
        this._props = options
        this.rewardsValues = options.rewards
        this.qTableHandler = options.qTableHandler
        this.explorationRate = options.settings.explorationRate.value
        // this.explorationRate = Math.max(
        //     0.01,
        //     options.settings.explorationRate.value - options.settings.explorationRateDecay.value * options.episode
        // )
        // this.explorationRate =
        //     options.settings.explorationRate.value *
        //     Math.pow(options.settings.explorationRateDecay.value, options.episode)
        // console.log(
        //     `QLearningBird ${options.episode} exploration rate: ${this.explorationRate}, decay: ${options.settings.explorationRateDecay.value}`
        // )
    }

    public override getFixture(): QLearningBirdProps {
        return this._props
    }

    public override update(data: UpdateData): void {
        const nextState = this.qTableHandler.getState(data)
        // this.ellapsedTimeMs += data.delta
        // this.nextState = this.qTableHandler.getState(data)
        // if (!this.currentState) {
        //     this.currentState = this.nextState
        //     return
        // }

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
            // this.reward && console.log(this.reward, this.alive)
            if (stateChanged || !this.alive) {
                this.moves.push({
                    state: this.qTableHandler.getStateHash(this.currentState),
                    action: this.action,
                    reward: this.reward ?? Rewards.MILLISECONDS_ALIVE,
                    // reward: this.rewardsValues.millisecondsAlive.value * this.ellapsedTimeMs,
                    nextState: this.qTableHandler.getStateHash(nextState),
                })
                this.reward = Rewards.MILLISECONDS_ALIVE
            }
            // if (this.alive) {
            // this.qTableHandler.updateQValue({
            //     nextState: nextState,
            //     currentState: this.currentState,
            //     reward: this.rewardsValues.millisecondsAlive.value * this.ellapsedTimeMs,
            //     action: this.action,
            // })
        }
        this.currentState = nextState
        // this.ellapsedTimeMs = 0
        // }
        // this.currentState = this.nextState
    }

    public override onPassedPipe(): void {
        // this.reward = this.rewardsValues.passedPipe
        this.reward = Rewards.PASSED_PIPE
        // console.log('Passed pipe')
        // // this.action = Actions.FLAP
        // if (this.currentState) {
        //     this.qTableHandler.updateQValue({
        //         nextState: this.nextState!,
        //         currentState: this.currentState,
        //         reward: this.rewardsValues.passedPipe.value,
        //         action: this.action,
        //     })
        // }
    }

    public override onHitFloor(): void {
        this.reward = Rewards.HIT_FLOOR
        // console.log('Hit floor')
        // this.reward = this.rewardsValues.hitFloor
        // this.alive = false
        // if (this.currentState) {
        //     this.qTableHandler.updateQValue({
        //         nextState: this.nextState!,
        //         currentState: this.currentState,
        //         reward: this.rewardsValues.hitFloor.value,
        //         action: this.action,
        //     })
        // }
    }

    public override onHitCeiling(): void {
        this.reward = Rewards.HIT_CEILING
        // console.log('Hit ceiling')
        // this.reward = this.rewardsValues.hitCeiling
        // this.alive = false
        // if (this.currentState) {
        //     this.qTableHandler.updateQValue({
        //         nextState: this.nextState!,
        //         currentState: this.currentState,
        //         reward: this.rewardsValues.hitCeiling.value,
        //         action: this.action,
        //     })
        // }
    }

    public override onHitTopPipeObstacle(): void {
        this.reward = Rewards.HIT_TOP_PIPE
        // console.log('Hit top pipe')
        // this.reward = this.rewardsValues.hitTopPipe
        // this.alive = false
        // if (this.currentState) {
        //     this.qTableHandler.updateQValue({
        //         nextState: this.nextState!,
        //         currentState: this.currentState,
        //         reward: this.rewardsValues.hitTopPipe.value,
        //         action: this.action,
        //     })
        // }
    }

    public override onHitBottomPipeObstacle(): void {
        this.reward = Rewards.HIT_BOTTOM_PIPE
        // console.log('Hit bottom pipe')
        // this.reward = this.rewardsValues.hitBottomPipe
        // this.alive = false
        // if (this.currentState) {
        //     this.qTableHandler.updateQValue({
        //         nextState: this.nextState!,
        //         currentState: this.currentState,
        //         reward: this.rewardsValues.hitBottomPipe.value,
        //         action: this.action,
        //     })
        // }
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
