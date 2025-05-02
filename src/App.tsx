import { useRef, useState } from 'react'
import { IRefPhaserGame, PhaserGame } from './PhaserGame'
import { MainMenu } from './game/scenes/MainMenu'
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import { defaultPlayersSettings } from './settings/PlayerSettings';
import { SelectPlayersComponent } from './settings/SelectPlayersComponent';


function App() {
    const [showGame, setShowGame] = useState<boolean>(false)

    // The sprite can only be moved in the MainMenu Scene
    const [canMoveSprite, setCanMoveSprite] = useState(true)

    //  References to the PhaserGame component (game and scene are exposed)
    const phaserRef = useRef<IRefPhaserGame | null>(null)
    const [spritePosition, setSpritePosition] = useState({ x: 0, y: 0 })

    const changeScene = () => {
        if (phaserRef.current) {
            const scene = phaserRef.current.scene as MainMenu

            if (scene) {
                scene.changeScene()
            }
        }
    }

    const moveSprite = () => {
        if (phaserRef.current) {
            const scene = phaserRef.current.scene as MainMenu

            if (scene && scene.scene.key === 'MainMenu') {
                // Get the update logo position
                scene.moveLogo(({ x, y }) => {
                    setSpritePosition({ x, y })
                })
            }
        }
    }

    const addSprite = () => {
        if (phaserRef.current) {
            const scene = phaserRef.current.scene

            if (scene) {
                // Add more stars
                const x = Phaser.Math.Between(64, scene.scale.width - 64)
                const y = Phaser.Math.Between(64, scene.scale.height - 64)

                //  `add.sprite` is a Phaser GameObjectFactory method and it returns a Sprite Game Object instance
                const star = scene.add.sprite(x, y, 'star')

                //  ... which you can then act upon. Here we create a Phaser Tween to fade the star sprite in and out.
                //  You could, of course, do this from within the Phaser Scene code, but this is just an example
                //  showing that Phaser objects and systems can be acted upon from outside of Phaser itself.
                scene.add.tween({
                    targets: star,
                    duration: 500 + Math.random() * 1000,
                    alpha: 0,
                    yoyo: true,
                    repeat: -1,
                })
            }
        }
    }

    // Event emitted from the PhaserGame component
    const currentScene = (scene: Phaser.Scene) => {
        setCanMoveSprite(scene.scene.key !== 'MainMenu')
    }

    const renderMainComponent = () => {
        if (showGame) {
            return <PhaserGame ref={phaserRef} currentActiveScene={currentScene} />
        }
        return <></>
    }

    return (
        <Container fluid={"lg"} id='app'>
            <Row className='h-100 g-0 justify-content-center align-items-center'>
                <Col xs={12} sm={8} lg={12} className='h-100'>
                    <SelectPlayersComponent value={defaultPlayersSettings} onPlayersSelected={() => ({})} />
                </Col>
                {/* <Col xs={12} sm={8} lg={12} className='h-75'>
                    {renderMainComponent()}
                </Col>
                <Col xs={12} sm={4} lg={12} className='h-25'>
                </Col> */}
            </Row>
        </Container>
    )
}

export default App
