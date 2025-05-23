import { gameConstants } from '../game/GameConstants'
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
    public static clearCompetitorsSettings() {
        localStorage.removeItem('gameSettings')
    }

    public static saveCompetitorsSettings(gameSettings: GameSettings) {
        localStorage.setItem('gameSettings', JSON.stringify(gameSettings))
    }
    public static getTimeFactor() {
        const saved = localStorage.getItem('timeFactor')
        if (saved) {
            return JSON.parse(saved || '{}') as number
        }
        const value = gameConstants.physics.timeFactor.default
        Repository.saveTimeFactor(value)
        return value
    }
    public static saveTimeFactor(timeFactor: number) {
        localStorage.setItem('timeFactor', JSON.stringify(timeFactor))
    }
    public static isMuted(): boolean {
        const saved = localStorage.getItem('isMuted')
        if (saved) {
            return JSON.parse(saved || '{}') as boolean
        } else {
        }
        Repository.saveMute(false)
        return false
    }
    public static saveMute(isMuted: boolean) {
        localStorage.setItem('isMuted', JSON.stringify(isMuted))
    }
}
