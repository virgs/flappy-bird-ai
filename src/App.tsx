import { faStop } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { ReactNode, useState } from 'react'
import Button from 'react-bootstrap/Button'
import Col from 'react-bootstrap/Col'
import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import './App.css'
import { PhaserGameComponent } from './PhaserGameComponent'
import { GameScene } from './game/scenes/GameScene'
import { RoundScene } from './game/scenes/RoundScene'
import { NavbarComponent } from './navbar/NavbarComponent'
import { GameSettings } from './settings/GameSettings'
import { SelectGameSettingsComponent } from './settings/SelectBirdsComponent'

export const HistoryChartComponent = () => {
    return (
        <div className="history-chart">
            <h2>History Chart</h2>
            {/* Chart implementation goes here */}
        </div>
    )
}

export const App = (): ReactNode => {
    const [navbarHeight, setNavbarHeight] = useState<number>(60)
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

    return (<>
        <Container fluid={'md'} id="app" className="p-0 m-0 h-100">
            <NavbarComponent
                onGameAbort={abortGame}
                onHeightChange={height => setNavbarHeight(height)}
            />
            <Row className="h-100 g-0 justify-content-center align-items-center"
                style={{ paddingTop: navbarHeight + 'px' }}>
                {!gameRunning && (
                    <Col xs={12} sm={8} lg={12} className="h-100 w-100">
                        <SelectGameSettingsComponent onPlayersSelected={settings => startGame(settings)} />
                    </Col>
                )}
                <Col
                    xs={12}
                    sm={8}
                    lg={12}
                    className="h-100 d-flex flex-column justify-content-center align-items-center"
                    style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        justifyContent: 'center',
                    }}>
                    <div className="h-25 w-100">
                        <HistoryChartComponent />
                    </div>

                    <div className="mt-auto w-100">
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
    </>)
}
