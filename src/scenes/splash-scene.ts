import {GeneticAlgorithm} from '../ai/genetic-algorithm';
import {Chromosome} from '../actors/chromosome';
import {GenerationsEvolutionChart} from '../charts/generations-evolution-chart';
import {UrlQueryHandler} from '../url-query-handler';

export class SplashScene extends Phaser.Scene {
    private static readonly MIN_SPLASH_TIME: 200;

    private generationsEvolutionChart: GenerationsEvolutionChart;
    private readonly populationPerGeneration: number;
    private geneticAlgorithm: GeneticAlgorithm;
    private loadCompleted: boolean;

    constructor() {
        super({
            key: 'SplashScene'
        });
        const urlQueryHandler = new UrlQueryHandler();
        this.populationPerGeneration = parseInt(urlQueryHandler.getParameterByName('populationPerGeneration', 2500));
        const mutationRate: number = parseFloat(urlQueryHandler.getParameterByName('mutationRate', 0.05));
        const selectedPopulationPerGeneration: number = parseInt(urlQueryHandler.getParameterByName('selectedPopulationPerGeneration', 20));
        this.geneticAlgorithm = new GeneticAlgorithm(mutationRate, this.populationPerGeneration, selectedPopulationPerGeneration);
        this.generationsEvolutionChart = new GenerationsEvolutionChart(selectedPopulationPerGeneration);
    }

    public preload(): void {
        this.load.image('splash', './assets/images/gui.png');
    }

    public init(data: {
        results: { chromosome: Chromosome, duration: number }[]
    }): void {
        this.loadCompleted = false;
        this.splashScreen();

        const nextGeneration = this.getNextGeneration(data);

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
        const mainSceneStart = () => this.scene.start('MainScene', {
            birds: nextGeneration
        });
        if (this.loadCompleted) {
            mainSceneStart();
        } else {
            this.load.on('complete', () => mainSceneStart());
        }
    }

    private getNextGeneration(data: { results: { chromosome: Chromosome; duration: number }[] }): Chromosome[] {
        if (data.results) {
            this.generationsEvolutionChart.addGenerationResult(data.results);
            return this.geneticAlgorithm.createNextGeneration(data.results);
        }
        return Array.from(Array(this.populationPerGeneration));
    }

    private loadImages() {
        const imagesToLoad = [
            'background-day.png',
            'background-night.png',
            'bottom-pipe.png',
            'top-pipe.png',
            'floor.png',
        ];

        imagesToLoad.forEach(image => this.load.image(image, `./assets/images/${image}`));
        ['bird-yellow', 'bird-red', 'bird-green', 'bird-blue'].forEach(key => {
            this.load.spritesheet(key, `./assets/images/${key}.png`, {
                frameWidth: 522 / 3,
                frameHeight: 124
            });
        });

    }

}
