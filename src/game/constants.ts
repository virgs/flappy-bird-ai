import backgroundDay from '../assets/images/background-day.png?raw'
import backgroundNight from '../assets/images/background-night.png?raw'
import birdBlue from '../assets/images/bird-blue.png?raw'
import birdGreen from '../assets/images/bird-green.png?raw'
import birdRed from '../assets/images/bird-red.png?raw'
import birdYellow from '../assets/images/bird-yellow.png?url'
import bottomPipe from '../assets/images/bottom-pipe.png?raw'
import floor from '../assets/images/floor.png?raw'
import topPipe from '../assets/images/top-pipe.png?raw'

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
}
