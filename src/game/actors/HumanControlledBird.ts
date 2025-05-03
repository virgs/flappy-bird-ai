import { Bird, Commands } from './Birds'
import KeyCodes = Phaser.Input.Keyboard.KeyCodes
import { defaultPlayersSettings } from '../../settings/PlayerSettings'

export class HumanControlledBird extends Bird {
    private readonly keys?: (Phaser.Input.Keyboard.Key | undefined)[] = []

    public constructor(options: { initialPosition: Phaser.Geom.Point; scene: Phaser.Scene }) {
        super({ ...options, playerSettings: defaultPlayersSettings.human })
        this.keys = [options.scene.input.keyboard?.addKey(KeyCodes.SPACE)]
    }

    protected childProcessInput(): boolean {
        if (this.keys?.some(key => key?.isDown)) {
            this.commands.push(Commands.FLAP_WING)
            return true
        }
        return false
    }
}
