import backgroundDay from '../assets/images/background-day.png?url'
import backgroundNight from '../assets/images/background-night.png?url'
import birdBlue from '../assets/images/bird-blue.png?url'
import birdGreen from '../assets/images/bird-green.png?url'
import birdRed from '../assets/images/bird-red.png?url'
import birdYellow from '../assets/images/bird-yellow.png?url'
import bottomPipe from '../assets/images/bottom-pipe.png?url'
import floor from '../assets/images/floor.png?url'
import topPipe from '../assets/images/top-pipe.png?url'

import wingFlap from '../assets/sfx/wing-flap.mp3?url'
import coin from '../assets/sfx/retro-coin.mp3?url'
import dropSound from '../assets/sfx/drop-sound.mp3?url'

export const gameConstants = {
    spriteSheet: {
        frameWidth: 174, // image.width / 3,
        frameHeight: 124,
        scale: 0.45,
        hitBoxScale: 0.75,
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
    imageAssets: {
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
        floorHeight: 0.15 * 768, // 0.15 * height
    },
    physics: {
        gravity: 0.003,
        horizontalVelocityInPixelsPerMs: 300 / 1000, // 300 pixels per second
        fixedFrameIntervalInMs: 10, // Every game iteration will be "10ms" apart
        pixelsPerFrame: (300 / 1000) * 10, // horizontalVelocityInPixelsPerMs * frameIntervalInMs
        timeFactor: {
            min: 0.1,
            max: 50,
            default: 1,
            step: 0.1,
        },
    },
    audioAssets: {
        flap: {
            key: 'flap',
            path: wingFlap,
        },
        coin: {
            key: 'coin',
            path: coin,
        },
        drop: {
            key: 'dropSound',
            path: dropSound,
        },
    },
    birdAttributes: {
        spriteDepth: {
            min: 10,
            max: 1000,
        },
        initialPosition: {
            x: 275,
            y: 150,
        },
        maxBirdAngle: 75, // degrees
        maxBirdVerticalSpeed: 0.75,
        flapImpulse: 0.75, // maxBirdVerticalSpeed
        flapCoolDownMs: 200,
    },
    obstacles: {
        spriteDepth: 1000,
        scale: 4,
        verticalOffset: {
            // proportion of the screen height
            min: 0.1,
            max: 0.5,
            total: 5,
        },
        verticalGapInPixels: 100,
        horizontalGapInPixels: 450,
    },
    scene: {
        humanGameOverDelayInMs: 2000,
    },
}
