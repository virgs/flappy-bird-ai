import { EventBus } from '../EventBus'
import { Bird, BirdProps, Commands } from './Birds'
import KeyCodes = Phaser.Input.Keyboard.KeyCodes

export class HumanControlledBird extends Bird {
    private readonly keys?: (Phaser.Input.Keyboard.Key | undefined)[] = []

    public constructor(options: BirdProps) {
        super(options)
        this.keys = [options.scene.input.keyboard?.addKey(KeyCodes.SPACE)]
        EventBus.on('game-container-pointer-down', () => this.commands.push(Commands.FLAP_WING))
    }

    protected childProcessInput(): boolean {
        if (this.keys?.some(key => key?.isDown)) {
            this.commands.push(Commands.FLAP_WING)
            return true
        }
        return false
    }
}
