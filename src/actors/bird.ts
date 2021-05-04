const initialLength: number = 5;

export class Snake {

    private readonly mapDimension: Phaser.Geom.Point;

    private updateTimeCounter: number = 0;
    private currentAngle: number = 0;
    private verticalSpeed: number = 0;
    private scene: Phaser.Scene;

    public constructor(options: { initialPosition: Phaser.Geom.Point, mapDimension: Phaser.Geom.Point, scene: Phaser.Scene }) {
        this.mapDimension = options.mapDimension;
        this.scene = options.scene;
        this.registerEvents();
        this.addHead(options.initialPosition);
    }

    private registerEvents() {
        // EventManager.on(Events.SNAKE_ENTERED_HOLE, (exitPoint: Phaser.Geom.Point) => {
        //     const head = this.body[0];
        //     if (head) {
        //         this.adjustSnakeNeck(head);
        //     }
        //     this.addHead(exitPoint);
        // });
        // EventManager.on(Events.SNAKE_ATE, () => ++this.increaseLength);
        // EventManager.on(Events.MILLISECONDS_PER_TILE_CHANGED, (tilesPerSecond: number) => this.milliSecondsPerTile = tilesPerSecond);
        // EventManager.on(Events.SNAKE_DIRECTION_CHANGED, (directions: Direction[]) => {
        //     if (directions.length === 1) {
        //         const nextDirection = directions[0];
        //         if ((this.currentDirection + nextDirection) % 2 !== 0) {
        //             this.nextDirection = nextDirection;
        //         }
        //     } else if (directions.length === 2) {
        //         switch (this.currentDirection) {
        //             case Direction.Up:
        //                 if (directions.includes(Direction.Left)) {
        //                     this.nextDirection = Direction.Left;
        //                 } else if (directions.includes(Direction.Right)) {
        //                     this.nextDirection = Direction.Right;
        //                 }
        //                 break;
        //             case Direction.Right:
        //                 if (directions.includes(Direction.Up)) {
        //                     this.nextDirection = Direction.Up;
        //                 } else if (directions.includes(Direction.Down)) {
        //                     this.nextDirection = Direction.Down;
        //                 }
        //                 break;
        //             case Direction.Down:
        //                 if (directions.includes(Direction.Left)) {
        //                     this.nextDirection = Direction.Left;
        //                 } else if (directions.includes(Direction.Right)) {
        //                     this.nextDirection = Direction.Right;
        //                 }
        //                 break;
        //             case Direction.Left:
        //                 if (directions.includes(Direction.Up)) {
        //                     this.nextDirection = Direction.Up;
        //                 } else if (directions.includes(Direction.Down)) {
        //                     this.nextDirection = Direction.Down;
        //                 }
        //                 break;
        //         }
        //     }
        // });
    }

    public update(delta: number): void {
        this.updateTimeCounter += delta;
        // if (this.updateTimeCounter > this.milliSecondsPerTile) {
        //     while (this.updateTimeCounter > this.milliSecondsPerTile) {
        //         this.updateTimeCounter -= this.milliSecondsPerTile;
        //     }
        //     this.increaseBodyLength();
        //     this.decreaseBodyLength();
        //     EventManager.emit(Events.SNAKE_MOVED, this.body.map(item => item.point));
        //
        //     const head = this.body[0];
        //     if (this.body
        //         .filter((_, index) => index > 0)
        //         .find(bodyItem => bodyItem.point.y === head.point.y && bodyItem.point.x === head.point.x)) {
        //         EventManager.emit(Events.SNAKE_COLLIDED_WITH_ITSELF);
        //     }
        //     this.currentDirection = this.nextDirection;
        // }
    }

    private addHead(point: Phaser.Geom.Point): void {
        // let nextPosition = null;
        // const sprite = this.scene.add.sprite(point.x * scale + (scale / 2), point.y * scale + (scale / 2), 'snake-head.bmp');
        // switch (this.nextDirection) {
        //     case Direction.Up:
        //         nextPosition = new Phaser.Geom.Point(point.x, point.y - 1);
        //         sprite.setAngle(0);
        //         break;
        //     case Direction.Right:
        //         nextPosition = new Phaser.Geom.Point(point.x + 1, point.y);
        //         sprite.setAngle(90);
        //         break;
        //     case Direction.Down:
        //         nextPosition = new Phaser.Geom.Point(point.x, point.y + 1);
        //         sprite.setAngle(180);
        //         break;
        //     default: // case Direction.Left:
        //         nextPosition = new Phaser.Geom.Point(point.x - 1, point.y);
        //         sprite.setAngle(-90);
        //         break;
        // }
        // sprite.setScale(scale / sprite.width);
        // nextPosition.x = (nextPosition.x + +this.mapDimension.x) % +this.mapDimension.x;
        // nextPosition.y = (nextPosition.y + +this.mapDimension.y) % +this.mapDimension.y;
        // const head: SnakeBodyElement = {
        //     currentDirection: this.nextDirection,
        //     sprite: sprite,
        //     point: nextPosition,
        // };
        // this.body.unshift(head);
    }

    public destroy() {
        // this.body.forEach(element => element.sprite.destroy());
    }
}
