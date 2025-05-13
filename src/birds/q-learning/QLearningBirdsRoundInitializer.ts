import { Geom } from 'phaser'
import { BirdProps } from '../../game/actors/BirdProps'
import { gameConstants } from '../../game/GameConstants'
import { RoundBirdInitializer } from '../../game/round/RoundBirdInitializer'
import { RoundResult } from '../../game/round/RoundResult'
import { BirdTypes } from '../../settings/BirdTypes'
import { QLearningBird, Rewards } from './QLearningBird'
import { QLearningSettings } from './QLearningSettings'
import { Actions, QTable, QTableHandler, State } from './QTableHandler'
import { Range } from '../../settings/BirdSettings'

export class QLearningBirdsRoundInitializer implements RoundBirdInitializer {
    private readonly qTableHandler: QTableHandler
    private readonly qLearningSettings: QLearningSettings
    private readonly birdsInitialPosition = new Geom.Point(
        gameConstants.birdAttributes.initialPosition.x,
        gameConstants.birdAttributes.initialPosition.y
    )
    private episode: number
    rewardMap: Map<Rewards, number>

    public constructor(qLearningSettings: QLearningSettings) {
        this.qLearningSettings = qLearningSettings
        this.qTableHandler = new QTableHandler(qLearningSettings)
        this.episode = 0
        this.rewardMap = new Map<Rewards, number>()
        this.rewardMap.set(Rewards.HIT_CEILING, qLearningSettings.rewards.hitCeiling.value)
        this.rewardMap.set(Rewards.HIT_BOTTOM_PIPE, qLearningSettings.rewards.hitBottomPipe.value)
        this.rewardMap.set(Rewards.HIT_TOP_PIPE, qLearningSettings.rewards.hitTopPipe.value)
        this.rewardMap.set(Rewards.HIT_FLOOR, qLearningSettings.rewards.hitFloor.value)
        this.rewardMap.set(Rewards.PASSED_PIPE, qLearningSettings.rewards.passedPipe.value)
        this.rewardMap.set(Rewards.MILLISECONDS_ALIVE, qLearningSettings.rewards.millisecondsAlive.value)
    }

    public createSubsequentRoundsSettings(roundResult: RoundResult): BirdProps[] {
        this.episode++
        const newLocal = roundResult.birdResults
            .filter(birdResult => birdResult.bird.getFixture().type === BirdTypes.Q_LEARNING)
            .map(birdResult => birdResult.bird as QLearningBird)
            .map((qLearningBird, index) => {
                if (index === 0) {
                    // @ts-expect-error
                    const table: QTable = qLearningBird.qTableHandler.table
                    console.log(
                        `Qtable states ${Object.keys(table).length}. Total: ${
                            this.qLearningSettings.verticalVelocityDiscretization.value *
                            this.qLearningSettings.gridSpatialAbstraction.vertical.value *
                            this.qLearningSettings.gridSpatialAbstraction.horizontal.value *
                            gameConstants.obstacles.verticalOffset.total
                        }`
                    )
                }
                this.updateQTable(qLearningBird.moves)
                return this.createQLearningBird()
            })
        return newLocal
    }
    private updateQTable(moves: { state: string; action: Actions; nextState: string; reward: Rewards }[]): void {
        // Updates Q-values considering special rewards after bird's death
        // Penalizes actions like flapping wings before dying at the top

        const reversedHistory = [...moves].reverse()
        // const lastState = reversedHistory[0].nextState
        // let diedHigh = [this.qLearningSettings.rewards.hitCeiling, this.qLearningSettings.rewards.hitTopPipe].includes(
        //     reversedHistory[0].reward
        // )

        let timeStep = 0
        // let lastFlapPenalty = true

        for (const { state, action, nextState, reward } of reversedHistory) {
            timeStep++

            // Increment visit counter for this state
            // if (!this.qTableHandler.table[state]) {
            //     this.qTableHandler.table[state] = {
            //         actions: { [Actions.DO_NOT_FLAP]: 0, [Actions.FLAP]: 0 },
            //         visits: 0,
            //     }
            // }
            // this.qTableHandler.table[state].visits++

            // // Determine reward
            // let reward: number =
            // if (timeStep <= 2) {
            //     reward = this.qLearningSettings.rewards.hitBottomPipe.value
            //     if (action === Actions.FLAP) {
            //         lastFlapPenalty = false
            //     }
            // } else if ((lastFlapPenalty || diedHigh) && action === Actions.FLAP) {
            //     reward = this.qLearningSettings.rewards.hitBottomPipe.value
            //     lastFlapPenalty = false
            //     diedHigh = false
            // } else {
            //     reward = this.qLearningSettings.rewards.millisecondsAlive.value
            // }

            // Get best next Q-value
            const bestNextQ = Math.max(
                this.qTableHandler.table[nextState].actions[Actions.FLAP],
                this.qTableHandler.table[nextState].actions[Actions.DO_NOT_FLAP]
            )

            // Update Q-value using Q-learning formula
            this.qTableHandler.table[state].actions[action] =
                (1 - this.qLearningSettings.learningRate.value) * this.qTableHandler.table[state].actions[action] +
                this.qLearningSettings.learningRate.value *
                    (this.rewardMap.get(reward)! + this.qLearningSettings.discountFactor.value * bestNextQ)
        }
    }

    public createFirstRoundSettings(): BirdProps[] {
        if (this.qLearningSettings.enabled) {
            this.episode++
            return Array.from({ length: this.qLearningSettings.totalPopulation.value }).map(() =>
                this.createQLearningBird()
            )
        }
        return []
    }

    private createQLearningBird(): BirdProps {
        const position = new Geom.Point(
            this.birdsInitialPosition.x + this.qLearningSettings.initialPositionHorizontalOffset + Math.random() * 10,
            this.birdsInitialPosition.y + Math.random() * gameConstants.gameDimensions.height * 0.5
        )
        return new QLearningBird({
            type: BirdTypes.Q_LEARNING,
            settings: this.qLearningSettings,
            rewards: this.qLearningSettings.rewards,
            textureKey: this.qLearningSettings.texture,
            initialPosition: position,
            qTableHandler: this.qTableHandler,
            episode: this.episode,
        })
    }
}
