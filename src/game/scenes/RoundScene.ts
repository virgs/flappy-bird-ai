import { Scene } from 'phaser'
import { EventBus, GameEvents } from '../EventBus'
import { RoundEngine } from '../round/RoundEngine'
import { AudioController } from '../audio/AudioController'
import { RoundSettings } from '../round/RoundSettings'
import { BirdTypes } from '../../settings/BirdTypes'
import { sleep } from '../../time/sleep'
import { gameConstants } from '../GameConstants'
import { Repository } from '../../repository/Repository'

export class RoundScene extends Scene {
    private audioController?: AudioController

    private currentTimeFactor: number = Repository.getTimeFactor()
    private roundEngine: RoundEngine
    private gameIsOver: boolean
    private roundSettings: RoundSettings
    private milisecondsElapsed: number

    constructor() {
        super('RoundScene')
        EventBus.on(GameEvents.TIME_FACTOR_CHANGED, (timeFactor: number) => (this.currentTimeFactor = timeFactor))
    }

    public create(roundSettings: RoundSettings) {
        this.audioController = new AudioController(this)
        EventBus.emit(GameEvents.UPDATE_GAME_SCENE, this)
        EventBus.emit(GameEvents.NEW_ROUND_STARTED, roundSettings)

        this.milisecondsElapsed = 0
        this.gameIsOver = false
        this.roundSettings = roundSettings
        this.roundEngine = new RoundEngine(this, roundSettings)
    }

    public async update(_time: number, delta: number): Promise<void> {
        if (this.gameIsOver) {
            return
        }
        //https://gafferongames.com/game-physics/fix-your-timestep
        this.milisecondsElapsed += delta * this.currentTimeFactor
        // max frame time to avoid spiral of death
        const maxFrameTime = gameConstants.physics.fixedFrameIntervalInMs * gameConstants.physics.timeFactor.max
        if (this.milisecondsElapsed > maxFrameTime) {
            this.milisecondsElapsed = maxFrameTime
        }

        while (this.milisecondsElapsed >= gameConstants.physics.fixedFrameIntervalInMs) {
            this.milisecondsElapsed -= gameConstants.physics.fixedFrameIntervalInMs
            this.updateFrame(gameConstants.physics.fixedFrameIntervalInMs)
        }
    }

    public async updateFrame(delta: number) {
        this.roundEngine.update(delta)
        if (this.roundEngine.isGameOver() && !this.gameIsOver) {
            this.gameIsOver = true
            if (this.roundSettings.birdSouls.some(bird => bird.getFixture().type === BirdTypes.HUMAN)) {
                console.log('Game over, waiting for human game over delay')
                await sleep(gameConstants.scene.humanGameOverDelayInMs)
            }

            const results = this.roundEngine.getResults()
            this.roundEngine.destroy()
            this.scene.start('GameScene', results)
        }
    }

    public abortGame() {
        this.audioController?.destroy()
        this.roundEngine.destroy()
        this.roundEngine.abortGame()
        this.scene.start('GameScene', this.roundEngine.getResults())
    }

    public abortRound() {
        this.audioController?.destroy()
        this.roundEngine.destroy()
        this.roundEngine.abortRound()
        this.scene.start('GameScene', this.roundEngine.getResults())
    }
}
