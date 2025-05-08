import { defaultGameSettings } from '../settings/DefaultBirdSettings'
import { GameSettings } from '../settings/GameSettings'

export class Repository {
    public static getGameSettings() {
        const saved = localStorage.getItem('gameSettings')
        if (saved) {
            return JSON.parse(saved || '{}') as GameSettings
        }
        return defaultGameSettings
    }
    public static getFactorySettings() {
        return JSON.parse(JSON.stringify(defaultGameSettings))
    }
    public static saveCompetitorsSettings(gameSettings: GameSettings) {
        localStorage.setItem('gameSettings', JSON.stringify(gameSettings))
    }
}
