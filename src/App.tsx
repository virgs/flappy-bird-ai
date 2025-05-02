import { useState } from 'react'
import { PhaserGameComponent } from './PhaserGameComponent'
import { MathScene } from './game/scenes/MathScene'
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import { defaultPlayersSettings, PlayerSettings } from './settings/PlayerSettings';
import { SelectPlayersComponent } from './settings/SelectPlayersComponent';


function App() {
    const [gameRunning, setGameRunning] = useState<boolean>(false)
    const [gameScene, setGameScene] = useState<Phaser.Scene | undefined>(undefined)
    const [playerSettings, setPlayerSettings] = useState<PlayerSettings>(defaultPlayersSettings)

    const startGame = (settings: PlayerSettings) => {
        console.log('Scene', gameScene)
        if (gameScene) {
            setPlayerSettings(settings)
            setGameRunning(true)
            const scene = gameScene as MathScene
            scene.startGame(settings)
        }
    }

    return (
        <Container fluid={"lg"} id='app'>
            <Row className='h-100 g-0 justify-content-center align-items-center'>
                {!gameRunning &&
                    <Col xs={12} sm={8} lg={12} className='h-100'>
                        <SelectPlayersComponent value={defaultPlayersSettings}
                            onPlayersSelected={(settings) => startGame(settings)} />
                    </Col>
                }
                <Col xs={12} sm={8} lg={12} className='h-100'>
                    <PhaserGameComponent onSceneChange={scene => setGameScene(scene)} />
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
