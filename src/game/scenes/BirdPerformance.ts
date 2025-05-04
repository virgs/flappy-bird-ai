import { BirdSettings, BirdTypes } from '../../settings/BirdSettings'

export type ResultData = {
    humanSettings: { timeAlive: number }[]
    neuroEvolutionarySettings: { timeAlive: number }[]
    simmulatedAnnealingSettings: { timeAlive: number }[]
    qTableSettings: { timeAlive: number }[]
}

export class BirdPerformance {
    private readonly result: ResultData = {
        humanSettings: [],
        neuroEvolutionarySettings: [],
        simmulatedAnnealingSettings: [],
        qTableSettings: [],
    }

    public computeDeath(birdSettings: BirdSettings, timeAlive: number) {
        switch (birdSettings.birdType) {
            case BirdTypes.Q_TABLE:
                this.result.qTableSettings.push({ timeAlive: timeAlive })
                break
        }
    }
    public getResults(): ResultData {
        return this.result
    }
}
