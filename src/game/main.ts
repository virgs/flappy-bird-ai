import { RoundScene } from './scenes/RoundScene'
import { EvaluationScene } from './scenes/EvaluationScene'
import { AUTO, Game } from 'phaser'
import { PreloaderScene } from './scenes/PreloaderScene'
import { gameConstants } from './GameConstants'

//  Find out more information about the Game Config at:
//  https://docs.phaser.io/api-documentation/typedef/types-core#gameconfig
const exportGameConfig: Phaser.Types.Core.GameConfig = {
    type: AUTO,
    width: gameConstants.gameDimensions.width,
    height: gameConstants.gameDimensions.height,
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    parent: 'game-container',
    backgroundColor: '#028af8',
    scene: [PreloaderScene, EvaluationScene, RoundScene],
}

const startGame = (parent: string) => {
    return new Game({ ...exportGameConfig, parent })
}

export default startGame
