import { AUTO, Game } from 'phaser'
import { gameConstants } from './GameConstants'
import { GameScene } from './scenes/GameScene'
import { PreloaderScene } from './scenes/PreloaderScene'
import { RoundScene } from './scenes/RoundScene'

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
    scene: [PreloaderScene, GameScene, RoundScene],
}

const startGame = (parent: string) => {
    const game = new Game({ ...exportGameConfig, parent })
    window.addEventListener('resize', function () {
        game.scale.refresh()
    })
    game.scale.refresh()

    return game
}

export default startGame
