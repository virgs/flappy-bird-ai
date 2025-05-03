import startGame from './game/main'
import { EventBus } from './game/EventBus'
import { ReactNode, useRef, useEffect } from 'react'

export interface IRefPhaserGame {
    game: Phaser.Game | null
    scene: Phaser.Scene | null
}

interface PhaserGameComponentProps {
    onSceneChange: (scene?: Phaser.Scene) => void
}

export const PhaserGameComponent = ({ onSceneChange }: PhaserGameComponentProps): ReactNode => {
    const game = useRef<Phaser.Game | null>(null)

    useEffect(() => {
        if (game.current === null) {
            game.current = startGame('game-container')
        }

        EventBus.on('current-scene-ready', (sceneInstance: Phaser.Scene) => onSceneChange(sceneInstance))

        return () => {
            if (game.current) {
                game.current.destroy(true)
                if (game.current !== null) {
                    game.current = null
                }
            }
            EventBus.removeListener('current-scene-ready')
        }
    }, [])

    return <div id="game-container"></div>
}
