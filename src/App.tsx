import { faStop } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { ReactNode, useState } from 'react'
import Button from 'react-bootstrap/Button'
import Container from 'react-bootstrap/Container'
import Col from 'react-bootstrap/Col'
import Row from 'react-bootstrap/Row'
import { PhaserGameComponent } from './PhaserGameComponent'
import { RoundScene } from './game/scenes/RoundScene'
import { GameScene } from './game/scenes/GameScene'
import { GameSettings } from './settings/GameSettings'
import { SelectGameSettingsComponent } from './settings/SelectBirdsComponent'
import './App.css'

export const App = (): ReactNode => {
    const [gameRunning, setGameRunning] = useState<boolean>(false)
    const [currentScene, setCurrentScene] = useState<Phaser.Scene | undefined>(undefined)

    const startGame = (settings: GameSettings) => {
        if (currentScene) {
            console.log('Starting game with settings:', settings)
            setGameRunning(true)
            const gameScene = currentScene as GameScene
            gameScene.startGame(settings)
        }
    }

    const abortGame = () => {
        if (currentScene) {
            setGameRunning(false)
            const roundScene = currentScene as RoundScene
            roundScene.abortGame()
        }
    }

    return (
        <Container fluid={'md'} id="app" className="p-0 m-0 h-100">
            <Row className="h-100 g-0 justify-content-center align-items-center">
                {!gameRunning && (
                    <Col xs={12} sm={8} lg={12} className="h-100">
                        <SelectGameSettingsComponent
                            onPlayersSelected={settings => startGame(settings)}
                        />
                    </Col>
                )}
                <Col
                    xs={12}
                    sm={8}
                    lg={12}
                    className="h-100"
                    style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        justifyContent: 'center',
                    }}>
                    <Button variant="outline-primary" className="play-button w-100 m-2" onPointerDown={abortGame}>
                        <span className="align-self-center fs-2">Abort</span>
                        <FontAwesomeIcon icon={faStop} className="mx-3 fs-2" />
                    </Button>
                    <div className="h-75 mt-auto w-100">
                        <PhaserGameComponent onSceneChange={scene => setCurrentScene(scene)} />
                    </div>
                </Col>
                {/* <Col xs={12} sm={8} lg={12} className='h-75'>
                    {renderMainComponent()}
                </Col>
                <Col xs={12} sm={4} lg={12} className='h-25'>
                </Col> */}
            </Row>
        </Container>
    )
}
