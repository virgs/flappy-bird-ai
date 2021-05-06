import {scale} from '../scale';
import {dimensionHeight, dimensionWidth} from '../game';
import {Chromosome} from './chromosome';
import {floorHeightInPixels} from './platform';
import {Events} from '../event-manager/events';
import {EventManager} from '../event-manager/event-manager';
import {DEBUG_MODE, flapCoolDownMs, flapImpulse, gravity, maxBirdAngle, maxBirdVerticalSpeed} from '../constants';
import KeyCodes = Phaser.Input.Keyboard.KeyCodes;
import RectangleToRectangle = Phaser.Geom.Intersects.RectangleToRectangle;
import {NeuralNetwork} from '../ai/neural-network';

enum Commands {
    FLAP_WING
}

export class Bird {

    private readonly assetsProportion = 0.125;
    private readonly hitBoxScale = 0.7;

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
    private readonly brain: NeuralNetwork;

    public constructor(options: { initialPosition: Phaser.Geom.Point, scene: Phaser.Scene, id: number, chromosome: Chromosome }) {
        this.id = options.id;
        this.chromosome = options.chromosome;
        this.brain = new NeuralNetwork({
            inputs: [
                {
                    //birdVerticalPosition
                    minValue: 0,
                    maxValue: dimensionHeight * scale,
                },
                {
                    //verticalDistanceToTheCenterOfClosestPipeGap
                    minValue: -dimensionHeight * scale,
                    maxValue: dimensionHeight * scale,
                },
                {
                    //horizontalDistanceToClosestPipe
                    minValue: 0,
                    maxValue: dimensionWidth * scale,
                }],
            hiddenNeurons: 4,
            outputs: 1,
            weights: this.chromosome ? this.chromosome.genes : null
        });
        if (!this.chromosome) {
            this.chromosome = {genes: this.brain.randomlyGenerateBrain()};
        }
        [this.birdSprite, this.hitBoxSprite] = this.createSprite(options);
        this.registerEvents(options.scene);
    }

    private createSprite(options: { initialPosition: Phaser.Geom.Point; scene: Phaser.Scene }): Phaser.GameObjects.Sprite[] {
        const birdSprite = options.scene.add.sprite(options.initialPosition.x, options.initialPosition.y, this.birdTextureKey);
        birdSprite.setScale(scale * this.assetsProportion);
        if (!options.scene.anims.get(this.birdTextureKey)) {
            options.scene.anims.create({
                key: this.birdTextureKey,
                frames: options.scene.anims.generateFrameNumbers(this.birdTextureKey, {
                    start: 1,
                    end: 3
                }),
                repeat: -1,
                frameRate: 12
            });
        }
        birdSprite.anims.load(this.birdTextureKey);
        birdSprite.anims.play(this.birdTextureKey);

        const hitBoxSprite = options.scene.add.sprite(options.initialPosition.x, options.initialPosition.y, this.birdTextureKey);
        hitBoxSprite.setScale(scale * this.assetsProportion * this.hitBoxScale);
        if (DEBUG_MODE) {
            hitBoxSprite.setTint(0x88FF0000);
            hitBoxSprite.setAlpha(0.5);
        } else {
            hitBoxSprite.setAlpha(0);
        }

        return [birdSprite, hitBoxSprite];
    }

    private registerEvents(scene): void {
        EventManager.on(Events.CLOSEST_PIPE_MOVED, options => this.closestPipe = options);
        EventManager.on(Events.UPDATE, updateOptions => this.update(updateOptions));
        this.keys = [scene.input.keyboard.addKey(KeyCodes.SPACE)];
    }

    public update(options: { delta, pixelsPerSecond }): void {
        if (this.alive) {
            this.handleCommands();
            this.inputTimeCounterMs += options.delta;
            if (this.inputTimeCounterMs > flapCoolDownMs) {
                if (this.handleBirdInput() || this.applyArtificialIntelligence()) {
                    this.inputTimeCounterMs %= flapCoolDownMs;
                }
            }
            if (this.birdIsOutOfBounds()) {
                this.killBird();
            } else {
                this.birdSprite.setAngle((this.verticalSpeed / maxBirdVerticalSpeed) * maxBirdAngle);
                this.hitBoxSprite.setAngle((this.verticalSpeed / maxBirdVerticalSpeed) * maxBirdAngle);
                if (this.verticalSpeed > 0) {
                    this.birdSprite.anims.stop();
                } else if (!this.birdSprite.anims.isPlaying) {
                    this.birdSprite.anims.play(this.birdTextureKey);
                }
            }
            this.handlePipeCollision();
        } else {
            this.birdSprite.x -= options.delta * options.pixelsPerSecond;
            this.hitBoxSprite.x -= options.delta * options.pixelsPerSecond;
            if (this.birdSprite.x + this.birdSprite.displayWidth < 0) {
                this.birdSprite.destroy();
                this.hitBoxSprite.destroy();
            }
        }
        this.applyGravity(options);
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
        if (this.alive) {
            this.alive = false;
            this.birdSprite.anims.pause();
            this.birdSprite.setAlpha(0.4);
            EventManager.emit(Events.BIRD_DIED, {chromosome: this.chromosome});
        }
    }

    private applyGravity(options: { delta; pixelsPerSecond }): void {
        const instantVerticalVelocity = gravity * options.delta;
        const verticalOffset = options.delta * (this.verticalSpeed + instantVerticalVelocity / 2);
        this.birdSprite.y = this.birdSprite.y + verticalOffset;
        this.hitBoxSprite.y = this.hitBoxSprite.y + verticalOffset;
        this.verticalSpeed = this.verticalSpeed + instantVerticalVelocity;
        if (this.verticalSpeed > maxBirdVerticalSpeed) {
            this.verticalSpeed = maxBirdVerticalSpeed;
        }
    }

    private handleBirdInput(): boolean {
        if (this.keys
            .some(key => key.isDown)) {
            this.commands.push(Commands.FLAP_WING);
            return true;
        }
        return false;
    }

    private applyArtificialIntelligence(): boolean {
        if (this.closestPipe != null) {
            const birdVerticalPosition = this.hitBoxSprite.getCenter().y;
            const verticalDistanceToTheCenterOfClosestPipeGap = this.hitBoxSprite.getCenter().y - this.closestPipe.verticalOffset;
            const horizontalDistanceToClosestPipe = this.closestPipe.sprites[0].x - this.hitBoxSprite.getCenter().x;
            const output = this.brain.doTheMagic(birdVerticalPosition, verticalDistanceToTheCenterOfClosestPipeGap, horizontalDistanceToClosestPipe);
            if (output[0] > 0.5) {
                this.commands.push(Commands.FLAP_WING);
                return true;
            }
        }
        return false;
    }

    private birdIsOutOfBounds(): boolean {
        const birdBounds = this.hitBoxSprite.getBounds();
        return birdBounds.top < 0 || birdBounds.bottom > (dimensionHeight - floorHeightInPixels) * scale;
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
}
