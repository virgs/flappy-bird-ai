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

        EventBus.on('update-current-scene', (sceneInstance: Phaser.Scene) => onSceneChange(sceneInstance))

        return () => {
            if (game.current) {
                game.current.destroy(true)
                if (game.current !== null) {
                    game.current = null
                }
            }
            EventBus.removeListener('update-current-scene')
        }
    }, [])

    return <div
        id="game-container"
        onPointerDown={() => EventBus.emit('game-container-pointer-down', this)}>

    </div>
}
