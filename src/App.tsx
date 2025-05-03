import { faStop } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useState } from 'react'
import Button from 'react-bootstrap/Button'
import Col from 'react-bootstrap/Col'
import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import { PhaserGameComponent } from './PhaserGameComponent'
import { MathScene } from './game/scenes/MathScene'
import { defaultPlayersSettings, PlayerSettings } from './settings/PlayerSettings'
import { SelectPlayersComponent } from './settings/SelectPlayersComponent'
import { GameScene } from './game/scenes/GameScene'

function App() {
    const [gameRunning, setGameRunning] = useState<boolean>(false)
    const [gameScene, setGameScene] = useState<Phaser.Scene | undefined>(undefined)
    const [playerSettings, setPlayerSettings] = useState<PlayerSettings>(defaultPlayersSettings)

    const startGame = (settings: PlayerSettings) => {
        if (gameScene) {
            setPlayerSettings(settings)
            setGameRunning(true)
            const scene = gameScene as MathScene
            scene.startGame(settings)
        }
    }

    const abortGame = () => {
        if (gameScene) {
            setGameRunning(false)
            const scene = gameScene as GameScene
            scene.abort()
        }
    }

    return (
        <Container fluid={'lg'} id="app" className="p-0 m-0 h-100">
            <Row className="h-100 g-0 justify-content-center align-items-center">
                {!gameRunning && (
                    <Col xs={12} sm={8} lg={12} className="h-100">
                        <SelectPlayersComponent
                            value={defaultPlayersSettings}
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
