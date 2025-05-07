import { IconDefinition } from '@fortawesome/fontawesome-svg-core'
import { faDna, faGamepad, faPlay, faTableList, faTemperatureLow } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { JSX, useState } from 'react'
import Accordion from 'react-bootstrap/Accordion'
import Button from 'react-bootstrap/Button'
import Form from 'react-bootstrap/Form'
import { BirdSettings } from './BirdSettings'
import { GameSettings } from './GameSettings'
import './SelectBirdsComponent.scss'
import { SimulatedAnnealingComponent } from '../birds/simmulated-annealing/SimulatedAnnealingComponent'
import { GeneticAlgorithm } from '../birds/neuro-evolutionary/GeneticAlgorithmComponent'

type AccordionForm = {
    icon: IconDefinition
    body: JSX.Element
    getBirdsSettings: (gameSettings: GameSettings) => BirdSettings
    setEnabled: (value: boolean, gameSettings: GameSettings) => GameSettings
}

export type SelectGameSettings = {
    value: GameSettings
    onPlayersSelected: (players: GameSettings) => void
}

export const SelectGameSettingsComponent = (props: SelectGameSettings) => {
    const [gameSettings, setGameSettings] = useState<GameSettings>(props.value)

    const accordionSructure: AccordionForm[] = [
        {
            icon: faGamepad,
            body: <>
                <span className='fs-5'>
                    <p>
                        Approximately 86 billion real neurons – depending on the human brain we are talking about – made of flesh and blood are in charge of performing advanced tasks such as deciding whether
                        to flap the bird or not.
                    </p>
                    Press <strong>SPACE-BAR</strong> or <strong>HIT</strong> the screen to flap the bird.
                </span>
            </>,
            getBirdsSettings: (gameSettings: GameSettings) => gameSettings.humanSettings,
            setEnabled: (value: boolean, gameSettings: GameSettings) => {
                const newGameSettings = { ...gameSettings }
                newGameSettings.humanSettings.enabled = value
                return newGameSettings
            },
        },
        {
            icon: faTableList,
            body: <>
                <span className='fs-5'>
                    <p>
                        <strong>Q-Learning</strong> is a type of reinforcement learning algorithm that learns the value of actions in a given state.
                        It uses a table to store the values of actions for each state, and updates these values based on the rewards received from the environment.
                        The algorithm uses a discount factor to balance the importance of immediate and future rewards.
                        Read more about it <a href="https://en.wikipedia.org/wiki/Q-learning" target="_blank" rel="noreferrer">here</a>.
                    </p>

                </span></>,
            getBirdsSettings: (gameSettings: GameSettings) => gameSettings.qLearningSettings,
            setEnabled: (value: boolean, gameSettings: GameSettings) => {
                const newGameSettings = { ...gameSettings }
                newGameSettings.qLearningSettings.enabled = value
                return newGameSettings
            },
        },
        {
            icon: faDna,
            body: <GeneticAlgorithm value={gameSettings.geneticAlgorithmSettings} onChange={() => ({})} />,
            getBirdsSettings: (gameSettings: GameSettings) => gameSettings.geneticAlgorithmSettings,
            setEnabled: (value: boolean, gameSettings: GameSettings) => {
                const newGameSettings = { ...gameSettings }
                newGameSettings.geneticAlgorithmSettings.enabled = value
                return newGameSettings
            },
        },
        {
            icon: faTemperatureLow,
            body: <SimulatedAnnealingComponent value={gameSettings.simulatedAnnealingSettings} onChange={() => ({})} />,
            getBirdsSettings: (gameSettings: GameSettings) => gameSettings.simulatedAnnealingSettings,
            setEnabled: (value: boolean, gameSettings: GameSettings) => {
                const newGameSettings = { ...gameSettings }
                newGameSettings.simulatedAnnealingSettings.enabled = value
                return newGameSettings
            },
        },

    ]

    return (
        <div id="select-players-component" className="d-flex h-100 w-100 flex-column align-items-between p-2">
            <p className="header fs-1 text-center">Select birds</p>
            <Accordion flush className="my-2">
                {accordionSructure.map((item, index) => {
                    const birdSettings = item.getBirdsSettings(gameSettings)
                    const backgroundColor = birdSettings.enabled ? birdSettings.cssColor : 'var(--bs-light)'
                    return (
                        <Accordion.Item
                            eventKey={index.toString()}
                            key={birdSettings.label}
                            style={{ backgroundColor: backgroundColor }}>
                            <Accordion.Header>
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
                            <Accordion.Body className='py-2'>
                                {item.body}
                            </Accordion.Body>
                        </Accordion.Item>
                    )
                })}
            </Accordion>
            <Button
                variant="outline-primary"
                className="play-button mt-auto w-100"
                disabled={Object.values(gameSettings).every(player => !player.enabled)}
                onPointerDown={() => props.onPlayersSelected(gameSettings)}>
                <span className="align-self-center fs-2">Play</span>
                <FontAwesomeIcon icon={faPlay} className="mx-3 fs-2" />
            </Button>
        </div>
    )
}
