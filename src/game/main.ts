import { GameScene } from './scenes/GameScene'
import { EvaluationScene } from './scenes/EvaluationScene'
import { AUTO, Game } from 'phaser'
import { PreloaderScene } from './scenes/PreloaderScene'
import { constants } from './Constants'

//  Find out more information about the Game Config at:
//  https://docs.phaser.io/api-documentation/typedef/types-core#gameconfig
const exportGameConfig: Phaser.Types.Core.GameConfig = {
    type: AUTO,
    width: constants.gameDimensions.width,
    height: constants.gameDimensions.height,
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    parent: 'game-container',
    backgroundColor: '#028af8',
    scene: [PreloaderScene, EvaluationScene, GameScene],
}

const startGame = (parent: string) => {
    return new Game({ ...exportGameConfig, parent })
}

export default startGame
