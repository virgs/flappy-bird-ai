import {scale} from '../scale';
import {EventManager} from '../event-manager/event-manager';
import {Events} from '../event-manager/events';
import {dimensionHeight} from '../game';
import RectangleToRectangle = Phaser.Geom.Intersects.RectangleToRectangle;
import KeyCodes = Phaser.Input.Keyboard.KeyCodes;

export class Bird {
    private readonly assetsProportion = 0.125;
    private readonly gravity: number = 0.0015;
    private readonly maxVerticalSpeed: number = 0.4;

    private readonly birdSprite: Phaser.GameObjects.Sprite;
    private readonly birdTextureKey = 'bird';

    private alive: boolean = true;
    private verticalSpeed: number = 0;

    private keyboardInput: Phaser.Input.Keyboard.Key[] = [];
    private inputUpdateTimeCounterMs: number = 0;
    private readonly flapCoolDownMs: number = 50;

    public constructor(options: { initialPosition: Phaser.Geom.Point, scene: Phaser.Scene }) {
        this.birdSprite = this.createSprite(options);
        this.registerEvents(options.scene);
    }


    private createSprite(options: { initialPosition: Phaser.Geom.Point; scene: Phaser.Scene }): Phaser.GameObjects.Sprite {
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
        return birdSprite;
    }

    private registerEvents(scene) {
        EventManager.on(Events.CLOSEST_PIPE_MOVED, options => this.handlePipeCollision(options));
        EventManager.on(Events.UPDATE, updateOptions => this.update(updateOptions));
        this.keyboardInput.push(scene.input.keyboard.addKey(KeyCodes.SPACE));
        this.keyboardInput.push(scene.input.keyboard.addKey(KeyCodes.ENTER));
    }

    private handlePipeCollision(options) {
        if (options.sprites.some(pipeSprite => RectangleToRectangle(pipeSprite.getBounds(), this.birdSprite.getBounds()))) {
            this.birdSprite.setAngle(45);
            this.alive = false;
            this.birdSprite.setAlpha(0.4);
            this.birdSprite.anims.stop();
        }
    }

    public update(options: { delta, pixelsPerSecond }): void {
        if (this.alive) {
            this.handleBirdInput(options.delta);
            const birdBounds = this.birdSprite.getBounds();
            if (birdBounds.top <= 0 || birdBounds.bottom > dimensionHeight * scale) {
                this.alive = false;
                this.birdSprite.setAlpha(0.4);
                this.birdSprite.anims.stop();
            } else {
                const instantVerticalVelocity = this.gravity * options.delta;
                this.birdSprite.y = this.birdSprite.y + options.delta * (this.verticalSpeed + instantVerticalVelocity / 2);
                this.verticalSpeed = this.verticalSpeed + instantVerticalVelocity;
                if (this.verticalSpeed > this.maxVerticalSpeed) {
                    this.verticalSpeed = this.maxVerticalSpeed;
                }
                this.birdSprite.setAngle((this.verticalSpeed / this.maxVerticalSpeed) * 45);
            }
        } else {
            this.birdSprite.x -= options.delta * options.pixelsPerSecond;
            if (this.birdSprite.x + this.birdSprite.displayWidth < 0) {
                this.birdSprite.destroy();
            }
        }
    }

    private handleBirdInput(delta: number) {
        this.inputUpdateTimeCounterMs += delta;
        if (this.inputUpdateTimeCounterMs > this.flapCoolDownMs) {
            this.inputUpdateTimeCounterMs %= this.flapCoolDownMs;
            if (this.keyboardInput
                .some(key => key.isDown)) {
                this.verticalSpeed = -this.maxVerticalSpeed;
            }
        }

    }
}
