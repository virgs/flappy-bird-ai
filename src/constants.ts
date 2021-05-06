import {scale} from './scale';

export const gravity: number = 0.0015;
export const maxBirdAngle = 55;
export const maxBirdVerticalSpeed: number = 0.5;
export const flapImpulse: number = 1 * maxBirdVerticalSpeed;
export const averageGapIntervalBetweenPipes: number = 2.5 * 1000;
export const randomFactorGapIntervalBetweenPipes: number = 1 * 1000;
export const birdXPosition: number = 75 * scale;
export const horizontalVelocityInPixelsPerSecond: number = 0.2;
export const flapCoolDownMs: number = 100;
