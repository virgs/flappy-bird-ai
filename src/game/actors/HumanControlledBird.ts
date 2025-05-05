import { Input } from 'phaser'
import { EventBus } from '../EventBus'
import { BirdSoul, BirdSoulProps, Commands, UpdateData } from './BirdSoul'

export class HumanControlledBird extends BirdSoul {
    private keys: (Input.Keyboard.Key | undefined)[] = []
    private commands: Commands[] = []

    public constructor(options: BirdSoulProps) {
        super(options)
        EventBus.on('game-container-pointer-down', () => this.commands.push(Commands.FLAP_WING))
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
