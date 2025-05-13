import { faBoltLightning, faCancel, faForwardStep, faVolumeMute, faVolumeUp } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { JSX, useEffect, useRef, useState } from 'react'
import Button from 'react-bootstrap/Button'
import Container from 'react-bootstrap/Container'
import Form from 'react-bootstrap/Form'
import Nav from 'react-bootstrap/Nav'
import Navbar from 'react-bootstrap/Navbar'
import ToggleButton from 'react-bootstrap/ToggleButton'
import ToggleButtonGroup from 'react-bootstrap/ToggleButtonGroup'
import { EventBus, GameEvents } from '../game/EventBus'
import './NavbarComponent.scss'
import { gameConstants } from '../game/GameConstants'
import { Repository } from '../repository/Repository'
import { RoundSettings } from '../game/round/RoundSettings'
import { BirdTypes } from '../settings/BirdTypes'

type NavbarComponentProps = {
    onHeightChange: (height: number) => void
    onGameAbort: () => void
}

const initialNavbarHeight = 72

export const NavbarComponent = (props: NavbarComponentProps): JSX.Element => {
    const [soundButtonEnabled, setSoundButtonEnabled] = useState<boolean>(true)
    const [soundMuted, setSoundMuted] = useState<boolean>(Repository.isMuted())
    const [timeFactor, setTimeFactor] = useState<number>(Repository.getTimeFactor())
    const [roundSettings, setRoundSettings] = useState<RoundSettings | undefined>()
    const navbarRef = useRef<HTMLDivElement>(null)

    const abortGame = () => {
        setRoundSettings(undefined)
        props.onGameAbort()
    }

    const goToNextIteration = () => {
        EventBus.emit(GameEvents.NEXT_ITERATION)
    }

    useEffect(() => {
        EventBus.emit(GameEvents.TIME_FACTOR_CHANGED, timeFactor)
        EventBus.on(GameEvents.NEW_ROUND_STARTED, (settings: RoundSettings) => {
            setRoundSettings(settings)
            setSoundButtonEnabled(settings.birdSouls.some(bird => bird.getFixture().type === BirdTypes.HUMAN))
        })
        EventBus.on(GameEvents.UPDATE_GAME_SCENE, (sceneInstance: Phaser.Scene) => {
            if (sceneInstance.scene.key !== 'RoundScene') {
                setRoundSettings(undefined)
            }
        })

        props.onHeightChange(navbarRef.current?.offsetHeight ?? initialNavbarHeight)
        const observer = new ResizeObserver(() => {
            props.onHeightChange(navbarRef.current?.offsetHeight ?? initialNavbarHeight)
        })

        if (navbarRef.current) {
            observer.observe(navbarRef.current)
        }
        return () => {
            navbarRef.current && observer.unobserve(navbarRef.current)
        }
    }, [])

    const resetTimeFactor = (): void => {
        const newValue = parseFloat((1.0).toFixed(1))
        setTimeFactor(newValue)
        Repository.saveTimeFactor(newValue)
        EventBus.emit(GameEvents.TIME_FACTOR_CHANGED, newValue)
    }

    return (
        <>
            <Navbar ref={navbarRef} fixed="top" className="bg-body-secondary mx-auto border-start border-end border-2">
                <Container>
                    {roundSettings && (
                        <>
                            <Nav className="me-auto">
                                <Button
                                    onPointerDown={abortGame}
                                    variant="danger"
                                    size="sm"
                                    className="fs-4 text-tertiary">
                                    <span className="d-none d-lg-inline mx-2">Abort Game</span>
                                    <FontAwesomeIcon icon={faCancel} />
                                </Button>
                                <Button
                                    variant="warning"
                                    size="sm"
                                    onPointerDown={goToNextIteration}
                                    className="fs-4 text-tertiary ms-2">
                                    <span className="d-none d-lg-inline mx-2">Next Iteration</span>
                                    <FontAwesomeIcon icon={faForwardStep} />
                                </Button>
                            </Nav>
                        </>
                    )}
                    <Nav className="mx-auto navbar-nav align-items-center">
                        <Navbar.Text
                            className="text-tertiary fs-4 d-none d-lg-inline me-1"
                            onPointerDown={() => resetTimeFactor()}>
                            Speed
                        </Navbar.Text>
                        <Navbar.Text className="text-tertiary fs-4 me-1">{timeFactor.toFixed(1)}x</Navbar.Text>
                        <Form.Range
                            min={gameConstants.physics.timeFactor.min}
                            max={gameConstants.physics.timeFactor.max}
                            step={gameConstants.physics.timeFactor.step}
                            value={timeFactor}
                            onChange={e => {
                                const newValue = parseFloat(e.currentTarget.value)
                                setTimeFactor(newValue)
                                Repository.saveTimeFactor(newValue)
                                EventBus.emit(GameEvents.TIME_FACTOR_CHANGED, newValue)
                            }}></Form.Range>
                        <FontAwesomeIcon
                            icon={faBoltLightning}
                            onPointerDown={() => resetTimeFactor()}
                            className="ms-1"
                        />
                    </Nav>

                    {roundSettings && (
                        <Nav className="">
                            <ToggleButtonGroup
                                type="checkbox"
                                defaultValue={soundButtonEnabled ? [1] : []}
                                className="d-flex flex-row">
                                <ToggleButton
                                    disabled={!soundButtonEnabled}
                                    variant="info"
                                    className="fs-4 text-tertiary"
                                    id={'sound-toggle'}
                                    size="sm"
                                    checked={!soundMuted}
                                    value={1}
                                    onChange={e => {
                                        const muted = e.currentTarget.checked
                                        EventBus.emit(GameEvents.TOGGLE_SOUND, muted)
                                        Repository.saveMute(muted)
                                        setSoundMuted(muted)
                                    }}>
                                    <span className="d-none d-lg-inline mx-2">{soundMuted ? 'Mute' : 'Sound on'}</span>
                                    <FontAwesomeIcon icon={soundMuted ? faVolumeMute : faVolumeUp} />
                                </ToggleButton>
                            </ToggleButtonGroup>
                        </Nav>
                    )}
                </Container>
            </Navbar>
        </>
    )
}
