import { Input } from 'phaser'
import { EventBus, GameEvents } from '../../game/EventBus'
import { BirdProps, BirdPropsFixture, Commands, UpdateData } from '../../game/actors/BirdProps'

export class HumanControlledBird extends BirdProps {
    private readonly _props: BirdPropsFixture
    private alive = true

    private keys: (Input.Keyboard.Key | undefined)[] = []
    private commands: Commands[] = []

    public constructor(options: BirdPropsFixture) {
        super()
        this._props = options
        EventBus.on(GameEvents.GAME_CONTAINER_POINTER_DOWN, () => this.commands.push(Commands.FLAP_WING))
    }

    public onDestroy(): void {
        EventBus.removeListener(GameEvents.GAME_CONTAINER_POINTER_DOWN)
    }

    public getFixture(): BirdPropsFixture {
        return this._props
    }

    public update(data: UpdateData): void {
        if (this.keys.length === 0) {
            this.keys = [data.scene.input.keyboard?.addKey(Input.Keyboard.KeyCodes.SPACE)]
        }
    }

    public shouldFlap(): boolean {
        const commands = [...this.commands]
        this.commands = []
        if (this.keys?.some(key => key?.isDown) || commands.length > 0) {
            EventBus.emit(GameEvents.HUMAN_CONTROLLED_BIRD_FLAPPED)
            return true
        }
        return false
    }

    public onPassedPipe(): void {
        if (this.alive) {
            EventBus.emit(GameEvents.HUMAN_CONTROLLED_BIRD_PASSED_PIPE)
        }
    }

    public onHitFloorOrCeiling(): void {
        this.alive = false
        EventBus.emit(GameEvents.HUMAN_CONTROLLED_BIRD_DIED)
    }

    public onHitObstacle(): void {
        this.alive = false
        EventBus.emit(GameEvents.HUMAN_CONTROLLED_BIRD_DIED)
    }
}
