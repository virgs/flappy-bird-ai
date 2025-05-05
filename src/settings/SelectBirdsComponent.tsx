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

type AccordionForm = {
    label: string
    color: string
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
            label: 'Human',
            color: 'warning',
            icon: faGamepad,
            body: <></>,
            getBirdsSettings: (gameSettings: GameSettings) => gameSettings.humanSettings,
            setEnabled: (value: boolean, gameSettings: GameSettings) => {
                const newGameSettings = { ...gameSettings }
                newGameSettings.humanSettings.enabled = value
                return newGameSettings
            },
        },
        {
            label: 'Neuro Evolutionary',
            color: 'success',
            icon: faDna,
            body: <></>,
            getBirdsSettings: (gameSettings: GameSettings) => gameSettings.neuroEvolutionarySettings,
            setEnabled: (value: boolean, gameSettings: GameSettings) => {
                const newGameSettings = { ...gameSettings }
                newGameSettings.neuroEvolutionarySettings.enabled = value
                return newGameSettings
            },
        },
        {
            label: 'Simulated Annealing',
            color: 'danger',
            icon: faTemperatureLow,
            body: <></>,
            getBirdsSettings: (gameSettings: GameSettings) => gameSettings.simmulatedAnnealingSettings,
            setEnabled: (value: boolean, gameSettings: GameSettings) => {
                const newGameSettings = { ...gameSettings }
                newGameSettings.simmulatedAnnealingSettings.enabled = value
                return newGameSettings
            },
        },
        {
            label: 'Q-Learning',
            color: 'info',
            icon: faTableList,
            body: <>adasdasdsa</>,
            getBirdsSettings: (gameSettings: GameSettings) => gameSettings.qLearningSettings,
            setEnabled: (value: boolean, gameSettings: GameSettings) => {
                const newGameSettings = { ...gameSettings }
                newGameSettings.qLearningSettings.enabled = value
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
                    const backgroundColor = birdSettings.enabled ? `var(--bs-${item.color})` : 'var(--bs-light)'
                    return (
                        <Accordion.Item
                            eventKey={index.toString()}
                            key={item.label}
                            style={{ backgroundColor: backgroundColor }}>
                            <Accordion.Header>
                                <FontAwesomeIcon
                                    className="fs-2 text-tertiary me-2"
                                    style={{ width: '10%' }}
                                    icon={item.icon}
                                />
                                <div className="label fs-4">{item.label}</div>
                                <Form.Check
                                    className="ms-auto fs-2"
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
                                    id={item.label + '-switch'}
                                />
                            </Accordion.Header>
                            <Accordion.Body>{item.body}</Accordion.Body>
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
