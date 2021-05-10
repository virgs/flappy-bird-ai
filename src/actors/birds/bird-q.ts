import {Bird, BirdType, Commands} from './bird';
import {dimensionHeight, dimensionWidth} from '../../game';
import {scale} from '../../scale';

enum QActions {
    FLAP = 'FLAP',
    DO_NOT_FLAP = 'DO_NOT_FLAP'
}

//https://levelup.gitconnected.com/introduction-to-reinforcement-learning-and-q-learning-with-flappy-bird-aa1f40614532
export class BirdQ extends Bird {
    // private static readonly maxFutureQ: number = 50;
    private static readonly rewards = {
        die: -1000,
        stayAlive: 15
    };

    //The learning rate controls how quickly the model is adapted to the problem, and is often in the range between 0.0 and 1.0.
    private static readonly learningRate: number = 0.95;

    //The discount factor is a measure of how much we want to care about future rewards rather than immediate rewards.
    //It is usually fairly high (because we put greater importance on long term gains) and between 0 and 1.
    private static readonly discountFactor: number = 0.75;

    private static readonly pixelPrecision = 15;

    private static qTable: {
        [QActions.FLAP]: number,
        [QActions.DO_NOT_FLAP]: number
    }[][] = null;

    private lastHorizontalDiff?: number;
    private lastVerticalDiff?: number;
    private lastAction?: QActions;
    private currentHorizontalDiff?: number;
    private currentVerticalDiff?: number;

    public constructor(options: { initialPosition: Phaser.Geom.Point, scene: Phaser.Scene, id: number }) {
        super(options, BirdType.Q_TABLE);
        if (BirdQ.qTable === null) {
            BirdQ.initializeQTable();
        }
    }

    private static initializeQTable() {
        const maxHorizontalDistance = Math.floor(dimensionWidth / BirdQ.pixelPrecision);
        const maxVerticalDistance = 2 * Math.floor(dimensionHeight / BirdQ.pixelPrecision);
        BirdQ.qTable = [];
        for (let horizontal = 0; horizontal < maxHorizontalDistance; ++horizontal) {
            BirdQ.qTable[horizontal] = [];
            for (let vertical = 0; vertical < maxVerticalDistance; ++vertical) {
                BirdQ.qTable[horizontal][vertical] = {
                    [QActions.FLAP]: 0,
                    [QActions.DO_NOT_FLAP]: 0
                };
            }
        }
    }

    protected handleBirdInput(data: {
        verticalPosition: number,
        closestPipeGapVerticalPosition: number,
        horizontalDistanceToClosestPipe: number,
        delta: number
    }): boolean {

        const nextHorizontalDiff = Math.abs(Math.floor(data.horizontalDistanceToClosestPipe / (BirdQ.pixelPrecision * scale)));
        const nextVerticalDiff = Math.floor((data.closestPipeGapVerticalPosition - data.verticalPosition) / (BirdQ.pixelPrecision * scale)) +
            Math.floor(dimensionHeight / BirdQ.pixelPrecision); //avoid negative numbers

        if (this.lastHorizontalDiff !== undefined &&
            this.lastVerticalDiff !== undefined &&
            this.lastAction !== undefined) {
            this.updateQValue(BirdQ.rewards.stayAlive);
        }

        this.lastHorizontalDiff = this.currentHorizontalDiff;
        this.lastVerticalDiff = this.currentVerticalDiff;

        this.currentHorizontalDiff = nextHorizontalDiff;
        this.currentVerticalDiff = nextVerticalDiff;

        if (this.lastHorizontalDiff !== nextHorizontalDiff && this.lastVerticalDiff !== nextVerticalDiff) {
            return this.shouldFlap();
        }
        return false;
    }

    protected onBirdDeath(): any {
        if (this.lastVerticalDiff && this.lastHorizontalDiff) {
            this.updateQValue(BirdQ.rewards.die);
        }
        return super.onBirdDeath();
    }

    private shouldFlap(): boolean {
        const qActions = BirdQ.qTable[this.currentHorizontalDiff][this.currentVerticalDiff];
        if (qActions[QActions.FLAP] > qActions[QActions.DO_NOT_FLAP]) {
            this.commands.push(Commands.FLAP_WING);
            this.lastAction = QActions.FLAP;
            return true;
        }
        this.lastAction = QActions.DO_NOT_FLAP;
        return false;
    }

    private updateQValue(reward: number) {
        //new_q = (1 - LEARNING_RATE) * current_q + LEARNING_RATE * (reward + DISCOUNT * max_future_q)
        const futureQActions = BirdQ.qTable[this.currentHorizontalDiff][this.currentVerticalDiff];
        const estimateMaxQValue = Math.max(futureQActions[QActions.FLAP], futureQActions[QActions.DO_NOT_FLAP]);

        const currentElement = BirdQ.qTable[this.lastHorizontalDiff][this.lastVerticalDiff];
        const currentQValue: number = currentElement[this.lastAction];
        currentElement[this.lastAction] =
            (1 - BirdQ.learningRate) * currentQValue + BirdQ.learningRate * (reward + BirdQ.discountFactor * estimateMaxQValue);
    }
}
