import { IconDefinition } from '@fortawesome/fontawesome-svg-core'
import {
    faDna,
    faGamepad,
    faPlay,
    faRecycle,
    faTableList,
    faTemperatureLow,
    faTrophy,
} from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { JSX, ReactNode, useState } from 'react'
import { ErrorBoundary, FallbackProps } from 'react-error-boundary'
import Accordion from 'react-bootstrap/Accordion'
import Button from 'react-bootstrap/Button'
import Col from 'react-bootstrap/Col'
import Form from 'react-bootstrap/Form'
import Row from 'react-bootstrap/Row'
import { GeneticAlgorithmComponent } from '../birds/neuro-evolutionary/GeneticAlgorithmComponent'
import { QLearningComponent } from '../birds/q-learning/QLearningComponent'
import { SimulatedAnnealingComponent } from '../birds/simmulated-annealing/SimulatedAnnealingComponent'
import { Repository } from '../repository/Repository'
import { BirdSettings } from './BirdSettings'
import { GameSettings } from './GameSettings'
import './SelectBirdsComponent.scss'

type AccordionForm = {
    icon: IconDefinition
    body: JSX.Element
    settings: BirdSettings
    setEnabled: (value: boolean, gameSettings: GameSettings) => GameSettings
}

export type SelectGameSettings = {
    onPlayersSelected: (players: GameSettings) => void
}

export const SelectGameSettingsComponent = (props: SelectGameSettings) => {
    const loadSettings = (): GameSettings => {
        const settings = Repository.getGameSettings()
        Repository.saveCompetitorsSettings(settings)
        return settings
    }

    const onFactoryReset = () => {
        const settings = Repository.getFactorySettings()
        setGameSettings(settings)
        Repository.saveCompetitorsSettings(settings)
    }

    const onCompetitorsSelected = (): void => {
        Repository.saveCompetitorsSettings(gameSettings)
        props.onPlayersSelected(gameSettings)
    }

    const fallbackRender = (data: FallbackProps): ReactNode => {
        data.resetErrorBoundary()
        // Call resetErrorBoundary() to reset the error boundary and retry the render.

        return (
            <div role="alert">
                <p>Something went wrong:</p>
                <pre style={{ color: 'red' }}>{data.error.message}</pre>
            </div>
        )
    }

    const [showSplashScreen, setShowSplashScreen] = useState<boolean>(true)
    const [gameSettings, setGameSettings] = useState<GameSettings>(loadSettings())

    const accordionSructure: AccordionForm[] = [
        {
            icon: faGamepad,
            body: (
                <>
                    <span className="fs-5">
                        <p>
                            Approximately 86 billion real neurons – depending on the human brain we are talking about –
                            made of flesh and blood are in charge of performing advanced tasks such as deciding whether
                            to flap the bird or not.
                        </p>
                        Press <strong>SPACE-BAR</strong> or <strong>HIT</strong> the screen to flap the bird.
                    </span>
                </>
            ),
            setEnabled: (value: boolean, gameSettings: GameSettings) => {
                const newGameSettings = { ...gameSettings }
                newGameSettings.humanSettings.enabled = value
                return newGameSettings
            },
            settings: gameSettings.humanSettings,
        },
        {
            icon: faTableList,
            body: (
                <QLearningComponent
                    value={gameSettings.qLearningSettings}
                    onChange={data => {
                        const newGameSettings = { ...gameSettings }
                        newGameSettings.qLearningSettings = data
                        setGameSettings(newGameSettings)
                    }}
                />
            ),
            settings: gameSettings.qLearningSettings,
            setEnabled: (value: boolean, gameSettings: GameSettings) => {
                const newGameSettings = { ...gameSettings }
                newGameSettings.qLearningSettings.enabled = value
                return newGameSettings
            },
        },
        {
            icon: faDna,
            body: (
                <GeneticAlgorithmComponent
                    value={gameSettings.geneticAlgorithmSettings}
                    onChange={data => {
                        const newGameSettings = { ...gameSettings }
                        newGameSettings.geneticAlgorithmSettings = data
                        setGameSettings(newGameSettings)
                    }}
                />
            ),
            settings: gameSettings.geneticAlgorithmSettings,
            setEnabled: (value: boolean, gameSettings: GameSettings) => {
                const newGameSettings = { ...gameSettings }
                newGameSettings.geneticAlgorithmSettings.enabled = value
                return newGameSettings
            },
        },
        {
            icon: faTemperatureLow,
            body: (
                <SimulatedAnnealingComponent
                    value={gameSettings.simulatedAnnealingSettings}
                    onChange={data => {
                        const newGameSettings = { ...gameSettings }
                        newGameSettings.simulatedAnnealingSettings = data
                        setGameSettings(newGameSettings)
                    }}
                />
            ),
            settings: gameSettings.simulatedAnnealingSettings,
            setEnabled: (value: boolean, gameSettings: GameSettings) => {
                const newGameSettings = { ...gameSettings }
                newGameSettings.simulatedAnnealingSettings.enabled = value
                return newGameSettings
            },
        },
    ]

    const renderSelectPlayersComponent = () => {
        return <>
            <p className="header text-center">
                <FontAwesomeIcon className="mx-5 d-none d-lg-inline" icon={faTrophy} />
                Select Competitors
                <FontAwesomeIcon className="mx-5 d-none d-lg-inline" icon={faTrophy} />
            </p>
            <Accordion flush className="my-2">
                {accordionSructure.map((item, index) => {
                    const birdSettings = item.settings
                    const backgroundColor = birdSettings.enabled ? birdSettings.cssColor : 'var(--bs-light)'
                    return (
                        <Accordion.Item eventKey={index.toString()} key={birdSettings.label}>
                            <Accordion.Header style={{ backgroundColor: backgroundColor }}>
                                <FontAwesomeIcon
                                    className="fs-2 text-tertiary me-2"
                                    style={{ width: '10%' }}
                                    icon={item.icon}
                                />
                                <div className="label fs-4">{birdSettings.label}</div>
                                <Form.Check
                                    className="ms-auto fs-2 enable-bird-switch"
                                    type="switch"
                                    onPointerDown={e => {
                                        e.preventDefault()
                                        e.stopPropagation() // Prevent the accordion from expanding
                                    }}
                                    onClick={e => {
                                        e.stopPropagation() // Prevent the accordion from expanding
                                    }}
                                    onChange={e => {
                                        const newGameSettings = { ...gameSettings }
                                        item.setEnabled(e.target.checked, newGameSettings)
                                        setGameSettings(newGameSettings)
                                    }}
                                    checked={birdSettings.enabled}
                                    id={birdSettings.label + '-switch'}
                                />
                            </Accordion.Header>
                            <ErrorBoundary
                                fallbackRender={fallbackRender}
                                onReset={details => {
                                    console.log('Resetting error boundary:', details)
                                    Repository.clearCompetitorsSettings()
                                    // Reset the state of your app so the error doesn't happen again
                                }}>
                                <Accordion.Body className="py-2">{item.body}</Accordion.Body>
                            </ErrorBoundary>
                        </Accordion.Item>
                    )
                })}
            </Accordion>
            <Row className="d-flex align-items-center justify-content-between mt-auto">
                <Col xs={'auto'}>
                    <Button variant="outline-danger" onPointerDown={() => onFactoryReset()}>
                        <span className="align-self-center fs-3">Restore</span>
                        <FontAwesomeIcon icon={faRecycle} className="ms-3 fs-3" />
                    </Button>
                </Col>
                <Col xs>
                    <Button
                        className="ms-auto w-100"
                        variant="outline-primary"
                        disabled={Object.values(gameSettings).every(player => !player.enabled)}
                        onPointerDown={() => onCompetitorsSelected()}>
                        <span className="align-self-center fs-3">Play</span>
                        <FontAwesomeIcon icon={faPlay} className="ms-3 fs-3" />
                    </Button>
                </Col>
            </Row>
        </>
    }

    const renderSplashScreen = () => {
        return (
            <div className="splash-screen d-flex flex-column justify-content-center align-items-center h-100 w-100 px-3"
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    backgroundColor: 'var(--bs-secondary)',
                    zIndex: 9999, // Ensure it is on top of other elements
                }}
                onClick={() => setShowSplashScreen(false)}>
                <h1 className="text-center text-primary text-stroke"
                    style={{ fontSize: '5rem' }}>Flappy Bird<sub className='text-info'>ai</sub></h1>
                <small className="text-center" style={{ fontSize: '1.5rem' }}>Tap anywhere to begin</small>
            </div>
        )
    }

    return (
        <div id="select-players-component" className="d-flex h-100 w-100 flex-column align-items-between p-2">
            {showSplashScreen ? renderSplashScreen() : renderSelectPlayersComponent()}
        </div>
    )
}
