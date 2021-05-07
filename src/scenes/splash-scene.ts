import {BirdType} from '../actors/birds/bird';
import {Chromosome} from '../actors/chromosome';
import {UrlQueryHandler} from '../url-query-handler';
import {GeneticAlgorithm} from '../ai/genetic-algorithm';
import {RoundEvolutionChart} from '../charts/round-evolution-chart';

export class SplashScene extends Phaser.Scene {
    private static readonly MIN_SPLASH_TIME: 200;

    private readonly chartEvolutionChart: RoundEvolutionChart = new RoundEvolutionChart();
    private readonly populationPerGeneration: number;
    private geneticAlgorithm: GeneticAlgorithm;
    private loadCompleted: boolean;

    constructor() {
        super({
            key: 'SplashScene'
        });
        const urlQueryHandler = new UrlQueryHandler();
        this.populationPerGeneration = parseInt(urlQueryHandler.getParameterByName('populationPerGeneration', 100));
        const mutationRate: number = parseFloat(urlQueryHandler.getParameterByName('mutationRate', 0.1));
        const selectedPopulationPerGeneration: number = parseInt(urlQueryHandler.getParameterByName('selectedPopulationPerGeneration', 10));
        this.geneticAlgorithm = new GeneticAlgorithm(mutationRate, this.populationPerGeneration, selectedPopulationPerGeneration);
    }

    public preload(): void {
        this.load.image('splash', './assets/images/gui.png');
    }

    public init(data: {
        geneticallyTrainedResults: { chromosome: Chromosome, duration: number }[],
        results: { type: BirdType, duration: number }[]
    }): void {
        this.loadCompleted = false;
        this.splashScreen();

        if (data.results) {
            this.chartEvolutionChart.addLastRoundResult(data.results);
        }
        const nextGeneration = this.getNextGeneration(data.geneticallyTrainedResults);

        this.time.addEvent({
            delay: SplashScene.MIN_SPLASH_TIME,
            callback: () => this.startMainScene(nextGeneration)
        });

    }

    private splashScreen(): void {
        const logo = this.add.sprite(this.game.renderer.width / 2, this.game.renderer.height / 2, 'splash');
        const scaleRatio = Math.min(window.innerWidth / logo.getBounds().width, window.innerHeight / logo.getBounds().height);
        logo.setScale(scaleRatio, scaleRatio);
        this.loadImages();
        this.load.start();
        this.load.on('complete', () => this.loadCompleted = true);
    }

    private startMainScene(nextGeneration: Chromosome[]) {
        const mainSceneStartFunction = () => this.scene.start('MainScene', {
            birds: nextGeneration
        });
        if (this.loadCompleted) {
            mainSceneStartFunction();
        } else {
            this.load.once('complete', () => mainSceneStartFunction());
        }
    }

    private getNextGeneration(geneticResults: { chromosome: Chromosome; duration: number }[]): Chromosome[] {
        if (geneticResults) {
            return this.geneticAlgorithm.createNextGeneration(geneticResults);
        }
        return Array.from(Array(this.populationPerGeneration));
    }

    private loadImages() {
        [
            'background-day',
            'background-night',
            'bottom-pipe',
            'top-pipe',
            'floor',
        ]
            .forEach(image => this.load.image(image, `./assets/images/${image}.png`));

        ['bird-yellow', 'bird-red', 'bird-green', 'bird-blue']
            .forEach(key => {
                this.load.spritesheet(key, `./assets/images/${key}.png`, {
                    frameWidth: 522 / 3,
                    frameHeight: 124
                });
            });

    }

}
