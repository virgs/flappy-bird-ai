import backgroundDay from '../assets/images/background-day.png?url'
import backgroundNight from '../assets/images/background-night.png?url'
import birdBlue from '../assets/images/bird-blue.png?url'
import birdGreen from '../assets/images/bird-green.png?url'
import birdRed from '../assets/images/bird-red.png?url'
import birdYellow from '../assets/images/bird-yellow.png?url'
import bottomPipe from '../assets/images/bottom-pipe.png?url'
import floor from '../assets/images/floor.png?url'
import topPipe from '../assets/images/top-pipe.png?url'

export const constants = {
    spriteSheet: {
        frameWidth: 174, // 522 / 3,
        frameHeight: 124,
        animation: {
            repeat: -1,
            frameRate: 12,
        },
        frameNumbers: {
            start: 0,
            end: 2,
        },
        assets: {
            birdYellow: {
                name: 'birdYellow',
                path: birdYellow,
            },
            birdBlue: {
                name: 'birdBlue',
                path: birdBlue,
            },
            birdRed: {
                name: 'birdRed',
                path: birdRed,
            },
            birdGreen: {
                name: 'birdGreen',
                path: birdGreen,
            },
        },
    },
    assets: {
        backgroundDay: {
            name: 'backgroundDay',
            path: backgroundDay,
        },
        backgroundNight: {
            name: 'backgroundNight',
            path: backgroundNight,
        },
        topPipe: {
            name: 'topPipe',
            path: topPipe,
        },
        bottomPipe: {
            name: 'bottomPipe',
            path: bottomPipe,
        },
        floor: {
            name: 'floor',
            path: floor,
        },
    },
    gameDimensions: {
        width: 1024,
        height: 768,
    },
    physics: {
        gravity: 0.0015,
        horizontalVelocityInPixelsPerSecond: 0.25,
    },
    birdAttributes: {
        initialPosition: {
            x: 75,
            y: 150,
        },
        maxBirdAngle: 55,
        maxBirdVerticalSpeed: 0.5,
        flapImpulse: 1.1 * 0.5, // 1.1 * maxBirdVerticalSpeed
        flapCoolDownMs: 100,
    },
    pipes: {
        averageHorizontalGapInPixels: 500,
        randomFactorHorizontalGapInPixels: 200,
        averageVerticalGapInPixels: 200,
    },
}
