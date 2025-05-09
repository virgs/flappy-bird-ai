import { ReactNode, useState } from 'react'
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
import { HistoryChartComponent } from './chart/HistoryChartComponent'

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
                    className="d-flex flex-column justify-content-center align-items-center"
                    style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        justifyContent: 'center',
                    }}>
                    <Row className="w-100 h-100 d-flex justify-content-center align-items-between"
                        ref={(el: HTMLElement) => el && el.style.setProperty("height", `calc(100svh - ${navbarHeight}px)`, "important")}>
                        <Col xs={12} sm={6} lg={12} className='d-flex justify-content-center align-items-center'>
                            <HistoryChartComponent />
                        </Col>
                        <Col xs={12} sm={6} lg={12}>
                            <PhaserGameComponent onSceneChange={scene => setCurrentScene(scene)} />
                        </Col>
                    </Row>

                </Col>
            </Row>
        </Container>
    </>)
}
