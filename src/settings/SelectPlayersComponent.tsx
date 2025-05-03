import { IconDefinition } from '@fortawesome/fontawesome-svg-core'
import { faDna, faGamepad, faPlay, faTableList, faTemperatureLow } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { JSX, useState } from 'react'
import Accordion from 'react-bootstrap/Accordion'
import Button from 'react-bootstrap/Button'
import Form from 'react-bootstrap/Form'
import { PlayerSettings } from './PlayerSettings'
import './SelectPlayersComponent.scss'

type AccordionForm = {
    label: string
    key: string
    color: string
    icon: IconDefinition
    body: JSX.Element
}

export type SelectPlayersComponentProps = {
    value: PlayerSettings
    onPlayersSelected: (players: PlayerSettings) => void
}

export const SelectPlayersComponent = (props: SelectPlayersComponentProps) => {
    const [players, setPlayers] = useState<PlayerSettings & { [key: string]: any }>(props.value)

    const accordionSructure: AccordionForm[] = [
        {
            label: 'Human',
            key: 'human',
            color: 'warning',
            icon: faGamepad,
            body: <></>,
        },
        {
            label: 'Neuro Evolutionary',
            key: 'neuroEvolutionaty',
            color: 'success',
            icon: faDna,
            body: <></>,
        },
        {
            label: 'Simulated Annealing',
            key: 'simmulatedAnnealing',
            color: 'danger',
            icon: faTemperatureLow,
            body: <></>,
        },
        {
            label: 'Q Table',
            key: 'qTable',
            color: 'info',
            icon: faTableList,
            body: <>adasdasdsa</>,
        },
    ]

    return (
        <div id="select-players-component" className="d-flex h-100 w-100 flex-column align-items-between p-2">
            <p className="header fs-1 text-center">Select players</p>
            <Accordion flush className="my-2">
                {accordionSructure.map((item, index) => {
                    const backgroundColor = players[item.key].enabled ? `var(--bs-${item.color})` : 'var(--bs-light)'
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
                                        const newPlayers = { ...players }
                                        newPlayers[item.key].enabled = e.target.checked
                                        setPlayers(newPlayers)
                                    }}
                                    checked={players[item.key].enabled}
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
                disabled={Object.values(players).every(player => !player.enabled)}
                onPointerDown={() => props.onPlayersSelected(players)}>
                <span className="align-self-center fs-2">Play</span>
                <FontAwesomeIcon icon={faPlay} className="mx-3 fs-2" />
            </Button>
        </div>
    )
}
