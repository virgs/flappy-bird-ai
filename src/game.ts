/// <reference path="./phaser.d.ts"/>

import 'phaser';
import {scale} from './scale';
import {MainScene} from './scenes/main-scene';
import {SplashScene} from './scenes/splash-scene';

export const [dimensionWidth, dimensionHeight] = [288, 256];
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
document.addEventListener('DOMContentLoaded', function () {
    // @ts-ignore
    const chart = Highcharts.chart('chart-container', {
        chart: {
            type: 'bar'
        },
        title: {
            text: 'Fruit Consumption'
        },
        xAxis: {
            categories: ['Apples', 'Bananas', 'Oranges']
        },
        yAxis: {
            title: {
                text: 'Fruit eaten'
            }
        },
        series: [{
            name: 'Jane',
            data: [1, 0, 4]
        }, {
            name: 'John',
            data: [5, 7, 3]
        }]
    });
});
