/// <reference path="./phaser.d.ts"/>

import 'phaser';
import {scale} from './scale';
import {MainScene} from './scenes/main-scene';
import {SplashScene} from './scenes/splash-scene';

const [dimensionWidth, dimensionHeight] = [288, 256];
const config: GameConfig = {
    width: dimensionWidth * scale,
    height: dimensionHeight * scale,
    type: Phaser.AUTO,
    parent: 'game',
    scene: [SplashScene, MainScene],
};

export class Game extends Phaser.Game {
    constructor(config: GameConfig) {
        super(config);
    }
}

window.addEventListener('load', () => new Game(config));
