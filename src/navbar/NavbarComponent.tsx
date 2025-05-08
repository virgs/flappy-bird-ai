import { faCancel, faChartLine, faForwardStep, faVolumeMute } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { JSX, useEffect, useRef, useState } from 'react';
import Button from 'react-bootstrap/Button';
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import { EventBus, GameEvents } from '../game/EventBus';
import "./NavbarComponent.scss";

type NavbarComponentProps = {
    onHeightChange: (height: number) => void
    onGameAbort: () => void
}

export const NavbarComponent = (props: NavbarComponentProps): JSX.Element => {
    const [roundIsRunning, setRoundIsRunning] = useState<boolean>(false);
    const navbarRef = useRef<HTMLDivElement>(null)

    const abortGame = () => {
        setRoundIsRunning(false)
        props.onGameAbort()
    }

    const goToNextIteration = () => {
        EventBus.emit(GameEvents.NEXT_ITERATION)
    }

    EventBus.on(GameEvents.UPDATE_GAME_SCENE, (sceneInstance: Phaser.Scene) => setRoundIsRunning(sceneInstance.scene.key === 'RoundScene'))

    useEffect(() => {
        props.onHeightChange(navbarRef.current?.offsetHeight ?? 60);

        const observer = new ResizeObserver(entries => {
            const { height } = entries[0].contentRect;
            props.onHeightChange(height);
        });

        if (navbarRef.current) {
            observer.observe(navbarRef.current);
        }

        return () => {
            if (navbarRef.current) {
                observer.unobserve(navbarRef.current);
            }
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
                                variant="outline-secondary"
                                size="sm"
                                className="fs-4 text-tertiary">
                                <span className="d-none d-lg-inline mx-2">Abort Game</span>
                                <FontAwesomeIcon icon={faCancel} />
                            </Button>
                            <Button
                                variant="outline-secondary"
                                size="sm"
                                onPointerDown={goToNextIteration}
                                className="fs-4 text-tertiary">
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
                        <Nav className="ms-auto">
                            <Button
                                variant="outline-secondary"
                                size="sm"
                                className="fs-4 text-tertiary">
                                <FontAwesomeIcon icon={faChartLine} />
                            </Button>
                        </Nav>
                    </>}
                    <Nav className={!roundIsRunning ? "ms-auto" : ''}>
                        <Button
                            variant="outline-secondary"
                            size="sm"
                            className="fs-4 text-tertiary">
                            <FontAwesomeIcon icon={faVolumeMute} />
                        </Button>
                    </Nav>
                    {/* </Navbar.Collapse> */}
                </Container>
            </Navbar>
        </>
    );
}