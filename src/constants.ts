import {scale} from './scale';

export const gravity: number = 0.0015;
export const maxBirdAngle = 55;
export const maxVerticalSpeed: number = 0.5;
export const flapImpulse: number = 1 * maxVerticalSpeed;
export const averageGapIntervalBetweenPipes: number = 2.5 * 1000;
export const randomFactorGapIntervalBetweenPipes: number = 1 * 1000;
export const birdXPosition: number = 75 * scale;
export const velocityInPixelsPerSecond: number = 0.15;
export const flapCoolDownMs: number = 100;
