import { Geom } from 'phaser'
import { BirdProps } from '../../game/actors/BirdProps'
import { HumanControlledBird } from './HumanControlledBird'
import { gameConstants } from '../../game/GameConstants'
import { RoundBirdInitializer } from '../../game/round/RoundBirdInitializer'
import { RoundResult } from '../../game/round/RoundResult'
import { HumanSettings } from '../../settings/BirdSettings'
import { BirdTypes } from '../../settings/BirdTypes'

export class HumanBirdsRoundInitializer implements RoundBirdInitializer {
    private readonly birdsInitialPosition = new Geom.Point(
        gameConstants.birdAttributes.initialPosition.x,
        gameConstants.birdAttributes.initialPosition.y
    )
    private readonly settings: HumanSettings

    public constructor(settings: HumanSettings) {
        this.settings = settings
    }

    public createSubsequentRoundsSettings(roundResult: RoundResult): BirdProps[] {
        return roundResult.birdResults
            .filter(result => result.bird.getFixture().type === BirdTypes.HUMAN)
            .map(() => this.createBird())
    }

    public createFirstRoundSettings(): BirdProps[] {
        if (this.settings.enabled) {
            return Array.from({ length: this.settings.totalPopulation.value }).map(() => this.createBird())
        }
        return []
    }

    private createBird(): BirdProps {
        const position = new Geom.Point(
            this.birdsInitialPosition.x + this.settings.initialPositionHorizontalOffset,
            this.birdsInitialPosition.y
        )
        return new HumanControlledBird({
            type: BirdTypes.HUMAN,
            textureKey: this.settings.texture,
            initialPosition: position,
        })
    }
}
