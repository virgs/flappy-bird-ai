import {scale} from './scale';

export const gravity: number = 0.0015;
export const maxBirdAngle = 55;
export const maxBirdVerticalSpeed: number = 0.5;
export const flapImpulse: number = 1.1 * maxBirdVerticalSpeed;
export const horizontalVelocityInPixelsPerSecond: number = 0.3;
export const averageGapIntervalBetweenPipesInPixels: number = 400;
export const randomFactorGapIntervalBetweenPipesInPixels: number = 200;
export const birdXPosition: number = 75 * scale;
export const flapCoolDownMs: number = 100;
export const DEBUG_MODE: boolean = false;
