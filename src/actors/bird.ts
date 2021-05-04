import {scale} from '../scale';
import {dimensionHeight} from '../game';
import {Events} from '../event-manager/events';
import {NeuralNetwork} from 'brain.js/src/index';
import {EventManager} from '../event-manager/event-manager';
import {flapCoolDownMs, gravity, maxVerticalSpeed} from '../constants';
import KeyCodes = Phaser.Input.Keyboard.KeyCodes;
import RectangleToRectangle = Phaser.Geom.Intersects.RectangleToRectangle;

enum Commands {
    FLAP_WING
}

export class Bird {

    private readonly assetsProportion = 0.125;
    private readonly hitBoxScale = 0.8;

    private readonly birdSprite: Phaser.GameObjects.Sprite;
    private readonly hitBoxSprite: Phaser.GameObjects.Sprite;
    private readonly birdTextureKey = 'bird';

    private commands: Commands[] = [];
    private alive: boolean = true;
    private verticalSpeed: number = 0;
    private inputTimeCounterMs: number = 0;

    private keys: Phaser.Input.Keyboard.Key[] = [];

    private neuralNetwork = new NeuralNetwork({});

    public constructor(options: { initialPosition: Phaser.Geom.Point, scene: Phaser.Scene, id: number }) {
        [this.birdSprite, this.hitBoxSprite] = this.createSprite(options);
        this.registerEvents(options.scene);
    }

    private createSprite(options: { initialPosition: Phaser.Geom.Point; scene: Phaser.Scene }): Phaser.GameObjects.Sprite[] {
        const birdSprite = options.scene.add.sprite(options.initialPosition.x, options.initialPosition.y, this.birdTextureKey);
        birdSprite.setScale(scale * this.assetsProportion);
        options.scene.anims.create({
            key: this.birdTextureKey,
            frames: options.scene.anims.generateFrameNumbers(this.birdTextureKey, {
                start: 1,
                end: 3
            }),
            repeat: -1,
            frameRate: 12
        });
        birdSprite.anims.load(this.birdTextureKey);
        birdSprite.anims.play(this.birdTextureKey);

        const hitBoxSprite = options.scene.add.sprite(options.initialPosition.x, options.initialPosition.y, this.birdTextureKey);
        hitBoxSprite.setScale(scale * this.assetsProportion * this.hitBoxScale);
        hitBoxSprite.setAlpha(0);

        return [birdSprite, hitBoxSprite];
    }

    private registerEvents(scene) {
        EventManager.on(Events.CLOSEST_PIPE_MOVED, options => this.handlePipeCollision(options));
        EventManager.on(Events.UPDATE, updateOptions => this.update(updateOptions));
        this.keys = [scene.input.keyboard.addKey(KeyCodes.SPACE)];
    }

    private handlePipeCollision(options) {
        if (this.alive) {
            if (options.sprites
                .some(pipeSprite => RectangleToRectangle(pipeSprite.getBounds(), this.hitBoxSprite.getBounds()))) {
                this.killBird();
            }
        }
    }

    public update(options: { delta, pixelsPerSecond }): void {
        if (this.alive) {
            this.handleBirdInput(options.delta);
            this.handleCommands();
            if (this.birdIsOutOfBounds()) {
                this.killBird();
            } else {
                this.applyGravity(options);
                this.birdSprite.setAngle((this.verticalSpeed / maxVerticalSpeed) * 45);
                this.hitBoxSprite.setAngle((this.verticalSpeed / maxVerticalSpeed) * 45);
            }
        } else {
            this.birdSprite.x -= options.delta * options.pixelsPerSecond;
            this.hitBoxSprite.x -= options.delta * options.pixelsPerSecond;
            if (this.birdSprite.x + this.birdSprite.displayWidth < 0) {
                this.birdSprite.destroy();
                this.hitBoxSprite.destroy();
            }
        }
    }

    private killBird() {
        this.alive = false;
        this.birdSprite.setAlpha(0.4);
        this.birdSprite.anims.stop();
        EventManager.emit(Events.BIRD_DIED);
    }

    private applyGravity(options: { delta; pixelsPerSecond }) {
        const instantVerticalVelocity = gravity * options.delta;
        const verticalOffset = options.delta * (this.verticalSpeed + instantVerticalVelocity / 2);
        this.birdSprite.y = this.birdSprite.y + verticalOffset;
        this.hitBoxSprite.y = this.hitBoxSprite.y + verticalOffset;
        this.verticalSpeed = this.verticalSpeed + instantVerticalVelocity;
        if (this.verticalSpeed > maxVerticalSpeed) {
            this.verticalSpeed = maxVerticalSpeed;
        }
    }

    private handleBirdInput(delta) {
        if (this.keys
            .some(key => key.isDown)) {
            if (this.inputTimeCounterMs > flapCoolDownMs) {
                this.commands.push(Commands.FLAP_WING);
            }
            this.inputTimeCounterMs %= flapCoolDownMs;
        } else {
            this.inputTimeCounterMs += delta;
        }
    }

    private birdIsOutOfBounds() {
        const birdBounds = this.hitBoxSprite.getBounds();
        return birdBounds.top <= 0 || birdBounds.bottom > dimensionHeight * scale;
    }

    private handleCommands() {
        [...new Set(this.commands)].forEach(command => {
            switch (command) {
                case Commands.FLAP_WING:
                    this.verticalSpeed = -maxVerticalSpeed;
            }
        });
        this.commands = [];
    }
}
