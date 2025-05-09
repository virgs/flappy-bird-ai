import startGame from './game/main'
import { EventBus, GameEvents } from './game/EventBus'
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

        EventBus.on(GameEvents.UPDATE_GAME_SCENE, (sceneInstance: Phaser.Scene) => onSceneChange(sceneInstance))

        return () => {
            if (game.current) {
                game.current.destroy(true)
                if (game.current !== null) {
                    game.current = null
                }
            }
            EventBus.removeListener(GameEvents.UPDATE_GAME_SCENE)
        }
    }, [])

    return (
        <div
            id="game-container"
            className="d-flex p-3 px-0"
            onPointerDown={() => EventBus.emit(GameEvents.GAME_CONTAINER_POINTER_DOWN, this)}
        />
    )
}
