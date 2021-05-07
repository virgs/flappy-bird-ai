import {scale} from '../../scale';
import {dimensionHeight} from '../../game';
import {floorHeightInPixels} from '../platform';
import {Events} from '../../event-manager/events';
import {EventManager} from '../../event-manager/event-manager';
import {DEBUG_MODE, flapCoolDownMs, flapImpulse, gravity, maxBirdAngle, maxBirdVerticalSpeed} from '../../constants';
import RectangleToRectangle = Phaser.Geom.Intersects.RectangleToRectangle;

export enum Commands {
    FLAP_WING
}

export enum BirdType {
    GENETICALLY_TRAINED,
    PLAYER_CONTROLLED,
    PLAYER_TRAINED,
}

export abstract class Bird {
    private static readonly textureKeys: string[] = ['bird-yellow', 'bird-blue', 'bird-green', 'bird-red'];

    private readonly assetsProportion = 0.125;
    private readonly hitBoxScale = 0.7;

    private readonly birdSprite: Phaser.GameObjects.Sprite;
    private readonly birdTextureKey: string;
    private readonly hitBoxSprite: Phaser.GameObjects.Sprite;
    private readonly id: number;

    private alive: boolean = true;
    private verticalSpeed: number = 0;
    private inputTimeCounterMs: number = 0;

    private closestPipe: any;
    private readonly birdType: BirdType;

    protected commands: Commands[] = [];

    protected constructor(options: { initialPosition: Phaser.Geom.Point, scene: Phaser.Scene, id: number }, birdType: BirdType) {
        this.birdType = birdType;
        this.id = options.id;
        this.birdTextureKey = Bird.textureKeys[birdType];
        [this.birdSprite, this.hitBoxSprite] = this.createSprite(options);
        this.registerEvents(options.scene);
    }

    protected abstract handleBirdInput(data: {
        verticalPosition: number,
        closestPipeGapVerticalPosition: number,
        horizontalDistanceToClosestPipe: number,
        delta: number
    }): boolean;

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
    }

    public update(options: { delta, pixelsPerSecond }): void {
        if (this.alive) {
            this.handleCommands();
            this.inputTimeCounterMs += options.delta;
            if (this.inputTimeCounterMs > flapCoolDownMs) {
                const closestPipeGapVerticalPosition = this.closestPipe.verticalOffset;
                const horizontalDistanceToClosestPipe = this.closestPipe.sprites[0].x - this.hitBoxSprite.getCenter().x;

                if (this.handleBirdInput({
                    verticalPosition: this.hitBoxSprite.getCenter().y,
                    closestPipeGapVerticalPosition,
                    horizontalDistanceToClosestPipe,
                    delta: options.delta
                })) {
                    this.inputTimeCounterMs = 0;
                }
            }
            if (!this.birdIsOutOfBounds()) {
                this.birdSprite.setAngle((this.verticalSpeed / maxBirdVerticalSpeed) * maxBirdAngle);
                this.hitBoxSprite.setAngle((this.verticalSpeed / maxBirdVerticalSpeed) * maxBirdAngle);
                if (this.verticalSpeed > 0) {
                    this.birdSprite.anims.stop();
                } else if (!this.birdSprite.anims.isPlaying) {
                    this.birdSprite.anims.play(this.birdTextureKey);
                }
            } else {
                this.killBird();
            }
            if (this.alive) {
                this.handlePipeCollision();
            }
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
            EventManager.emit(Events.BIRD_DIED, {type: this.birdType, data: this.dataToSendOnBirdDeath()});
        }
    }

    protected dataToSendOnBirdDeath(): any {
        return null;
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
        if (this.birdSprite.y > (dimensionHeight - floorHeightInPixels) * scale) {
            this.birdSprite.y = (dimensionHeight - floorHeightInPixels) * scale;
            this.hitBoxSprite.y = (dimensionHeight - floorHeightInPixels) * scale;
        }
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
