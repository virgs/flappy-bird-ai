import { Input } from 'phaser'
import { EventBus } from '../../game/EventBus'
import { BirdSoul, BirdSoulProps, Commands, UpdateData } from '../../game/actors/BirdSoul'

export class HumanControlledBird extends BirdSoul {
    private readonly _props: BirdSoulProps

    private keys: (Input.Keyboard.Key | undefined)[] = []
    private commands: Commands[] = []

    public constructor(options: BirdSoulProps) {
        super()
        this._props = options
        EventBus.on('game-container-pointer-down', () => this.commands.push(Commands.FLAP_WING))
    }

    public getSoulProperties(): BirdSoulProps {
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
            return true
        }
        return false
    }
}
