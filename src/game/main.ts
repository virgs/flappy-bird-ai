import { GameOver } from './scenes/GameOver'
import { Game as MainGame } from './scenes/Game'
import { MainMenu } from './scenes/MainMenu'
import { AUTO, Game } from 'phaser'
import { Preloader } from './scenes/Preloader'
import { constants } from './constants'

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
    scene: [Preloader, MainMenu, MainGame, GameOver],
}

const StartGame = (parent: string) => {
    return new Game({ ...exportGameConfig, parent })
}

export default StartGame
