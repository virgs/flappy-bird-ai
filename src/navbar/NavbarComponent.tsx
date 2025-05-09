import { faBoltLightning, faCancel, faForwardStep, faVolumeMute } from '@fortawesome/free-solid-svg-icons'
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

type NavbarComponentProps = {
    onHeightChange: (height: number) => void
    onGameAbort: () => void
}

const initialNavbarHeight = 72

export const NavbarComponent = (props: NavbarComponentProps): JSX.Element => {
    const [soundIsOn, setSoundIsOn] = useState<boolean>(true)
    const [timeFactor, setTimeFactor] = useState<number>(Repository.getTimeFactor())
    const [roundIsRunning, setRoundIsRunning] = useState<boolean>(false)
    const navbarRef = useRef<HTMLDivElement>(null)

    const abortGame = () => {
        setRoundIsRunning(false)
        props.onGameAbort()
    }

    const goToNextIteration = () => {
        EventBus.emit(GameEvents.NEXT_ITERATION)
    }

    useEffect(() => {
        EventBus.emit(GameEvents.TIME_FACTOR_CHANGED, timeFactor)

        EventBus.on(GameEvents.UPDATE_GAME_SCENE, (sceneInstance: Phaser.Scene) =>
            setRoundIsRunning(sceneInstance.scene.key === 'RoundScene')
        )

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

    return (
        <>
            <Navbar ref={navbarRef} fixed="top" className="bg-body-secondary mx-auto border-start border-end border-2">
                <Container>
                    {roundIsRunning && (
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
                        <Navbar.Text className="text-tertiary fs-4 d-none d-lg-inline me-1">
                            Speed
                        </Navbar.Text>
                        <Navbar.Text className="text-tertiary fs-4 me-1">
                            {timeFactor.toFixed(1)}x
                        </Navbar.Text>
                        <Form.Range
                            min={gameConstants.physics.timeFactor.min}
                            max={gameConstants.physics.timeFactor.max}
                            step={gameConstants.physics.timeFactor.step}
                            value={timeFactor}
                            onChange={e => {
                                const newValue = parseFloat(e.currentTarget.value)
                                setTimeFactor(newValue)
                                EventBus.emit(GameEvents.TIME_FACTOR_CHANGED, newValue)
                            }}
                        >

                        </Form.Range>
                        <FontAwesomeIcon icon={faBoltLightning} className='ms-1' />
                    </Nav>



                    {roundIsRunning && (
                        <Nav className="">
                            <ToggleButtonGroup type="checkbox" defaultValue={[1]}>
                                <ToggleButton
                                    variant="info"
                                    className="fs-4 text-tertiary"
                                    id={'sound-toggle'}
                                    size="sm"
                                    checked={soundIsOn}
                                    value={1}
                                    onChange={e => setSoundIsOn(e.currentTarget.checked)}>
                                    <span className="d-none d-lg-inline mx-2">Toggle Sound</span>
                                    <FontAwesomeIcon icon={faVolumeMute} />
                                </ToggleButton>
                            </ToggleButtonGroup>
                        </Nav>)}
                </Container>
            </Navbar>
        </>
    )
}
