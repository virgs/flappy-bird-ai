import { Geom } from 'phaser'
import { BirdSoul } from '../../game/actors/BirdSoul'
import { gameConstants } from '../../game/GameConstants'
import { RoundBirdInitializer } from '../../game/round/RoundBirdInitializer'
import { RoundResult } from '../../game/round/RoundResult'
import { BirdTypes } from '../../settings/BirdSettings'
import { QLearningSettings } from './QLearningSettings'
import { QLearningBird } from './QLearningBird'
import { QTableHandler } from './QTableHandler'

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

    public createSubsequentRoundsSettings(roundResult: RoundResult): BirdSoul[] {
        return roundResult.birdResults
            .filter(birdResult => birdResult.bird.getSoulProperties().type === BirdTypes.Q_LEARNING)
            .map(() => this.createQLearningBird())
    }

    public createFirstRoundSettings(): BirdSoul[] {
        if (this.qLearningSettings.enabled) {
            return Array.from({ length: this.qLearningSettings.totalPopulation.value }).map(() =>
                this.createQLearningBird()
            )
        }
        return []
    }

    private createQLearningBird(): BirdSoul {
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
