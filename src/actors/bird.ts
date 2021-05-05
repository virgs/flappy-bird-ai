import {scale} from '../scale';
import {dimensionHeight} from '../game';
import {Events} from '../event-manager/events';
import {NeuralNetwork} from 'brain.js/src/index';
import {EventManager} from '../event-manager/event-manager';
import {flapCoolDownMs, flapImpulse, gravity, maxBirdAngle, maxVerticalSpeed} from '../constants';
import KeyCodes = Phaser.Input.Keyboard.KeyCodes;
import RectangleToRectangle = Phaser.Geom.Intersects.RectangleToRectangle;
import {Chromosome} from './chromosome';

enum Commands {
    FLAP_WING
}

export class Bird {

    private readonly assetsProportion = 0.125;
    private readonly hitBoxScale = 0.8;

    private readonly birdSprite: Phaser.GameObjects.Sprite;
    private readonly hitBoxSprite: Phaser.GameObjects.Sprite;
    private readonly birdTextureKey = 'bird';
    private readonly id: number;

    private commands: Commands[] = [];
    private alive: boolean = true;
    private verticalSpeed: number = 0;
    private inputTimeCounterMs: number = 0;
    private closestPipe: any;

    private keys: Phaser.Input.Keyboard.Key[] = [];

    private readonly chromosome: Chromosome;
    private readonly neuralNetwork;

    public constructor(options: { initialPosition: Phaser.Geom.Point, scene: Phaser.Scene, id: number, chromosome: Chromosome }) {
        this.id = options.id;
        this.neuralNetwork = new NeuralNetwork({
            binaryThresh: 0.75,
            hiddenLayers: [4],
            activation: 'relu'
        });
        this.chromosome = options.chromosome;
        this.neuralNetwork.train(this.chromosome.genes);
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

    private registerEvents(scene): void {
        EventManager.on(Events.CLOSEST_PIPE_MOVED, options => this.closestPipe = options);
        EventManager.on(Events.UPDATE, updateOptions => this.update(updateOptions));
        this.keys = [scene.input.keyboard.addKey(KeyCodes.SPACE)];
    }

    public update(options: { delta, pixelsPerSecond }): void {
        if (this.alive) {
            this.handleBirdInput(options.delta);
            this.handleCommands();
            this.handlePipeCollision();
            this.trainNetwork();
            if (this.birdIsOutOfBounds()) {
                this.killBird();
            } else {
                this.applyGravity(options);
                this.birdSprite.setAngle((this.verticalSpeed / maxVerticalSpeed) * maxBirdAngle);
                this.hitBoxSprite.setAngle((this.verticalSpeed / maxVerticalSpeed) * maxBirdAngle);
                if (this.verticalSpeed > 0) {
                    this.birdSprite.anims.stop();
                } else if (!this.birdSprite.anims.isPlaying) {
                    this.birdSprite.anims.play(this.birdTextureKey);
                }
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

    private handlePipeCollision(): void {
        if (this.closestPipe != null) {
            if (this.closestPipe.sprites
                .some(pipeSprite => RectangleToRectangle(pipeSprite.getBounds(), this.hitBoxSprite.getBounds()))) {
                this.killBird();
            }
        }
    }

    private killBird(): void {
        this.alive = false;
        this.birdSprite.setAlpha(0.4);
        EventManager.emit(Events.BIRD_DIED, {chromosome: this.chromosome});
    }

    private applyGravity(options: { delta; pixelsPerSecond }): void {
        const instantVerticalVelocity = gravity * options.delta;
        const verticalOffset = options.delta * (this.verticalSpeed + instantVerticalVelocity / 2);
        this.birdSprite.y = this.birdSprite.y + verticalOffset;
        this.hitBoxSprite.y = this.hitBoxSprite.y + verticalOffset;
        this.verticalSpeed = this.verticalSpeed + instantVerticalVelocity;
        if (this.verticalSpeed > maxVerticalSpeed) {
            this.verticalSpeed = maxVerticalSpeed;
        }
    }

    private handleBirdInput(delta): void {
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

    private birdIsOutOfBounds(): boolean {
        const birdBounds = this.hitBoxSprite.getBounds();
        const floorHeightInPixels = 18;
        return birdBounds.top <= 0 || birdBounds.bottom > (dimensionHeight - floorHeightInPixels) * scale;
    }

    private handleCommands(): void {
        [...new Set(this.commands)].forEach(command => {
            switch (command) {
                case Commands.FLAP_WING:
                    this.verticalSpeed = -flapImpulse;
            }
        });
        this.commands = [];
    }

    private trainNetwork(): void {
        if (this.closestPipe != null) {
            const verticalDistance = this.hitBoxSprite.getCenter().y - this.closestPipe.verticalOffset;
            const horizontalDistance = this.hitBoxSprite.getCenter().x - this.closestPipe.sprites[0].x;
            // let numbers = this.neuralNetwork.run([verticalDistance, horizontalDistance]);
            if (this.id === 1) {
                // console.log(numbers);
            }
        }
    }
}
