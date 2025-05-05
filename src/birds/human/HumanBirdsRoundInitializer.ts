import { Geom } from 'phaser'
import { BirdSoul } from '../../game/actors/BirdSoul'
import { HumanControlledBird } from '../../game/actors/HumanControlledBird'
import { gameConstants } from '../../game/GameConstants'
import { RoundBirdInitializer } from '../../game/round/RoundBirdInitializer'
import { RoundResult } from '../../game/round/RoundResult'
import { BirdTypes, HumanSettings } from '../../settings/BirdSettings'

export class HumanBirdsRoundInitializer implements RoundBirdInitializer {
    private readonly birdsInitialPosition = new Geom.Point(
        gameConstants.birdAttributes.initialPosition.x,
        gameConstants.birdAttributes.initialPosition.y
    )
    private readonly settings: HumanSettings

    public constructor(settings: HumanSettings) {
        this.settings = settings
    }

    public createSubsequentRoundsSettings(roundResult: RoundResult): BirdSoul[] {
        return roundResult.birdResults
            .filter(result => result.bird.props.type === BirdTypes.HUMAN)
            .map(() => this.createBird())
    }

    public createFirstRoundSettings(): BirdSoul[] {
        if (this.settings.enabled) {
            return Array.from({ length: this.settings.totalPopulation }).map(() => this.createBird())
        }
        return []
    }

    private createBird(): BirdSoul {
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
