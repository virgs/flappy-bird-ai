import { Geom } from 'phaser'
import { BirdProps } from '../../game/actors/BirdProps'
import { gameConstants } from '../../game/GameConstants'
import { RoundBirdInitializer } from '../../game/round/RoundBirdInitializer'
import { RoundResult } from '../../game/round/RoundResult'
import { BirdTypes } from '../../settings/BirdTypes'
import { QLearningBird, Move as QLearningMove, Rewards } from './QLearningBird'
import { QLearningSettings } from './QLearningSettings'
import { Actions, QTable, QTableHandler } from './QTableHandler'

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
        return roundResult.birdResults
            .filter(birdResult => birdResult.bird.getFixture().type === BirdTypes.Q_LEARNING)
            .map(birdResult => birdResult.bird as QLearningBird)
            .map(qLearningBird => {
                this.updateQTable(qLearningBird.moves)
                return this.createQLearningBird()
            })
    }
    private updateQTable(moves: QLearningMove[]): void {
        const reversedHistory = [...moves].reverse()

        const alpha = this.qLearningSettings.learningRate.value
        const gamma = this.qLearningSettings.discountFactor.value

        for (const move of reversedHistory) {
            this.qTableHandler.table[move.state].visits++
            // const alpha = 1 / this.qTableHandler.table[move.state].visits

            // Get best next Q-value
            const bestNextQ = Math.max(
                this.qTableHandler.table[move.nextState].actions[Actions.FLAP],
                this.qTableHandler.table[move.nextState].actions[Actions.DO_NOT_FLAP]
            )

            // Update Q-value using Q-learning formula
            this.qTableHandler.table[move.state].actions[move.action] =
                (1 - alpha) * this.qTableHandler.table[move.state].actions[move.action] +
                alpha * (this.rewardMap.get(move.reward)! + gamma * bestNextQ)
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
