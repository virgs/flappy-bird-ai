import { Geom } from 'phaser'
import { BirdProps } from '../../game/actors/BirdProps'
import { gameConstants } from '../../game/GameConstants'
import { RoundBirdInitializer } from '../../game/round/RoundBirdInitializer'
import { RoundResult } from '../../game/round/RoundResult'
import { BirdTypes } from '../../settings/BirdTypes'
import { QLearningSettings } from './QLearningSettings'
import { QLearningBird } from './QLearningBird'
import { QTable, QTableHandler, QTuple } from './QTableHandler'

export class QLearningBirdsRoundInitializer implements RoundBirdInitializer {
    private readonly qTableHandler: QTableHandler
    private readonly qLearningSettings: QLearningSettings
    private readonly birdsInitialPosition = new Geom.Point(
        gameConstants.birdAttributes.initialPosition.x,
        gameConstants.birdAttributes.initialPosition.y
    )

    public constructor(qLearningSettings: QLearningSettings) {
        this.qLearningSettings = qLearningSettings
        this.qTableHandler = new QTableHandler(qLearningSettings)
    }

    public createSubsequentRoundsSettings(roundResult: RoundResult): BirdProps[] {
        const newLocal = roundResult.birdResults
            .filter(birdResult => birdResult.bird.getFixture().type === BirdTypes.Q_LEARNING)
            .map((birdResult, index) => {
                if (index === 0) {
                    //@ts-expect-error
                    const table: QTable = birdResult.bird.qTableHandler.table
                    const visits = Object.values(table).reduce((acc: number, value: QTuple) => {
                        return acc + value.visits
                    }, 0 as number)
                    console.log(
                        `Qtable states ${Object.keys(table).length}, time alive: ${birdResult.timeAlive}, total visits: ${visits}`
                    )
                    // console.log(table)
                }
                return this.createQLearningBird()
            })
        return newLocal
    }

    public createFirstRoundSettings(): BirdProps[] {
        if (this.qLearningSettings.enabled) {
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
            rewards: this.qLearningSettings.rewards,
            textureKey: this.qLearningSettings.texture,
            initialPosition: position,
            qTableHandler: this.qTableHandler,
        })
    }
}
