import { Geom } from 'phaser'
import { BirdProps } from '../../game/actors/BirdProps'
import { gameConstants } from '../../game/GameConstants'
import { RoundBirdInitializer } from '../../game/round/RoundBirdInitializer'
import { RoundResult } from '../../game/round/RoundResult'
import { BirdTypes } from '../../settings/BirdTypes'
import { Move as QLearningMove, QLearningBird, Rewards } from './QLearningBird'
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
        let sum = 0
        const newLocal = roundResult.birdResults
            .filter(birdResult => birdResult.bird.getFixture().type === BirdTypes.Q_LEARNING)
            .map(birdResult => {
                sum += birdResult.timeAlive
                return birdResult.bird as QLearningBird
            })
            .map((qLearningBird, index) => {
                if (index === 0 && this.episode % 50 === 0) {
                    // @ts-expect-error
                    const table: QTable = qLearningBird.qTableHandler.table
                    // @ts-expect-error
                    const states: { [propname: string]: Set<number> } = qLearningBird.qTableHandler.states
                    console.log(
                        `Qtable states ${Object.keys(table).length}. Total: ${
                            this.qLearningSettings.verticalVelocityDiscretization.value *
                            this.qLearningSettings.gridSpatialAbstraction.vertical.value *
                            this.qLearningSettings.gridSpatialAbstraction.horizontal.value *
                            gameConstants.obstacles.verticalOffset.total
                        }, avg ${(sum / this.qLearningSettings.totalPopulation.value).toFixed(2)}`
                    )
                    console.log(
                        'States:',
                        Object.keys(states).map(
                            key =>
                                `${key} (${states[key].size}): ${[...states[key]].sort((a: number, b: number) => a - b)}`
                        )
                    )
                }
                this.updateQTable(qLearningBird.moves)
                return this.createQLearningBird()
            })
        return newLocal
    }
    private updateQTable(moves: QLearningMove[]): void {
        const reversedHistory = [...moves].reverse()

        for (const move of reversedHistory) {
            // Get best next Q-value
            const bestNextQ = Math.max(
                this.qTableHandler.table[move.nextState].actions[Actions.FLAP],
                this.qTableHandler.table[move.nextState].actions[Actions.DO_NOT_FLAP]
            )

            // Update Q-value using Q-learning formula
            this.qTableHandler.table[move.state].actions[move.action] =
                (1 - this.qLearningSettings.learningRate.value) *
                    this.qTableHandler.table[move.state].actions[move.action] +
                this.qLearningSettings.learningRate.value *
                    (this.rewardMap.get(move.reward)! + this.qLearningSettings.discountFactor.value * bestNextQ)
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
            this.birdsInitialPosition.x,
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
