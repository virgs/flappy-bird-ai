import { faCancel, faChartLine, faForwardStep, faVolumeMute } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { JSX, useEffect, useRef, useState } from 'react';
import Button from 'react-bootstrap/Button';
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import ToggleButton from 'react-bootstrap/ToggleButton';
import ToggleButtonGroup from 'react-bootstrap/ToggleButtonGroup';
import { EventBus, GameEvents } from '../game/EventBus';
import "./NavbarComponent.scss";

type NavbarComponentProps = {
    onHeightChange: (height: number) => void
    onGameAbort: () => void
}

const initialNavbarHeight = 72;

export const NavbarComponent = (props: NavbarComponentProps): JSX.Element => {
    const [historyChartVisible, setHistoryChartVisible] = useState<boolean>(false);
    const [roundIsRunning, setRoundIsRunning] = useState<boolean>(false);
    const navbarRef = useRef<HTMLDivElement>(null)

    const abortGame = () => {
        setRoundIsRunning(false)
        props.onGameAbort()
    }

    const goToNextIteration = () => {
        EventBus.emit(GameEvents.NEXT_ITERATION)
    }


    useEffect(() => {
        EventBus.on(GameEvents.UPDATE_GAME_SCENE, (sceneInstance: Phaser.Scene) => setRoundIsRunning(sceneInstance.scene.key === 'RoundScene'))

        props.onHeightChange(navbarRef.current?.offsetHeight ?? initialNavbarHeight);
        const observer = new ResizeObserver(() => {
            props.onHeightChange(navbarRef.current?.offsetHeight ?? initialNavbarHeight);
        });

        if (navbarRef.current) {
            observer.observe(navbarRef.current);
        }
        return () => {
            navbarRef.current && observer.unobserve(navbarRef.current);
        };
    }, []);

    return (
        <>
            <Navbar ref={navbarRef}
                fixed="top"
                className="bg-body-secondary border-end-0 border-start-0 border-top-0 mx-auto">
                <Container>
                    {roundIsRunning && <>
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
                            {/* <Navbar.Text className="text-tertiary fs-4 mx-2">
                                <Form.Range
                                    min={.1}
                                    max={10}
                                    step={.1}
                                // value={1}
                                />
                            </Navbar.Text> */}
                        </Nav>
                        <Nav className="ms-auto me-2">
                            <ToggleButtonGroup type="checkbox" defaultValue={[]}>
                                <ToggleButton
                                    variant="info"
                                    className="fs-4 text-tertiary"
                                    id={'chart-togle'}
                                    size='sm'
                                    checked={historyChartVisible}
                                    value={1}
                                    onChange={(e) => setHistoryChartVisible(e.currentTarget.checked)}
                                >
                                    <FontAwesomeIcon icon={faChartLine} />
                                </ToggleButton>
                            </ToggleButtonGroup>
                        </Nav>
                    </>}
                    <Nav className={!roundIsRunning ? "ms-auto" : ''}>
                        <Button
                            variant="primary"
                            size="sm"
                            className="fs-4 text-tertiary">
                            <FontAwesomeIcon icon={faVolumeMute} />
                        </Button>
                    </Nav>
                </Container>
            </Navbar>
        </>
    );
}