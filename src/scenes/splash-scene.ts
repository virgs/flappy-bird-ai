import {GeneticAlgorithm} from '../ai/genetic-algorithm';
import {Chromosome} from '../actors/chromosome';
import {GenerationsEvolutionChart} from '../charts/generations-evolution-chart';

export class SplashScene extends Phaser.Scene {
    private static readonly MIN_TIME: 200;

    private geneticAlgorithm: GeneticAlgorithm = new GeneticAlgorithm();
    private generationsEvolutionChart: GenerationsEvolutionChart = new GenerationsEvolutionChart();
    private loadCompleted: boolean;

    constructor() {
        super({
            key: 'SplashScene'
        });
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
            delay: SplashScene.MIN_TIME,
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

    private getNextGeneration(data: { results: { chromosome: Chromosome; duration: number }[] }) {
        if (!data.results) {
            return this.geneticAlgorithm.randomlyGenerate();
        } else {
            this.generationsEvolutionChart.addGenerationResult(data.results);
            return this.geneticAlgorithm.createNextGeneration(data.results);
        }
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
        let birdKey = 'bird';
        this.load.spritesheet(birdKey, './assets/images/bird.png', {
            frameWidth: 522 / 3,
            frameHeight: 124
        });

    }

}
