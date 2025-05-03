import { faStop } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useState } from 'react'
import Button from 'react-bootstrap/Button'
import Col from 'react-bootstrap/Col'
import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import { PhaserGameComponent } from './PhaserGameComponent'
import { GameScene } from './game/scenes/GameScene'
import { EvaluationScene } from './game/scenes/EvaluationScene'
import { GameSettings } from './settings/GameSettings'
import { defaultBirdSettings } from './settings/DefaultBirdSettings'
import { SelectPlayersComponent } from './settings/SelectPlayersComponent'

function App() {
    const [gameRunning, setGameRunning] = useState<boolean>(false)
    const [scene, setGameScene] = useState<Phaser.Scene | undefined>(undefined)
    const [playerSettings, setPlayerSettings] = useState<GameSettings>(defaultBirdSettings)

    const startGame = (settings: GameSettings) => {
        if (scene) {
            setPlayerSettings(settings)
            setGameRunning(true)
            const evaluationScene = scene as EvaluationScene
            evaluationScene.startGame(settings)
        }
    }

    const abortGame = () => {
        if (scene) {
            setGameRunning(false)
            const gameScene = scene as GameScene
            gameScene.abort()
        }
    }

    return (
        <Container fluid={'lg'} id="app" className="p-0 m-0 h-100">
            <Row className="h-100 g-0 justify-content-center align-items-center">
                {!gameRunning && (
                    <Col xs={12} sm={8} lg={12} className="h-100">
                        <SelectPlayersComponent
                            value={playerSettings}
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
                    <div className="h-75 mt-auto">
                        <PhaserGameComponent onSceneChange={scene => setGameScene(scene)} />
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

export default App
