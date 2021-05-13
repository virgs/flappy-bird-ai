import {Chromosome} from '../actors/chromosome';
import {UrlQueryHandler} from '../url-query-handler';
import {GeneticAlgorithm} from '../ai/genetic-algorithm';
import {RoundEvolutionChart} from '../charts/round-evolution-chart';
import {SimulatedAnnealingAlgorithm} from '../ai/simulated-annealing-algorithm';
import {BirdAttributes, BirdValues} from '../actors/birds/bird-attributes';

export class SplashScene extends Phaser.Scene {
    private static readonly MIN_SPLASH_TIME: 200;

    private readonly qBirdsNumber: number;
    private readonly chartEvolutionChart: RoundEvolutionChart = new RoundEvolutionChart();
    private readonly populationPerGeneration: number;
    private readonly simulatedAnnealingAlgorithm: SimulatedAnnealingAlgorithm;
    private readonly geneticAlgorithm: GeneticAlgorithm;
    private loadCompleted: boolean;

    constructor() {
        super({
            key: 'SplashScene'
        });
        const urlQueryHandler = new UrlQueryHandler();
        this.qBirdsNumber = parseInt(urlQueryHandler.getParameterByName('qBirdsNumber', 100));
        this.populationPerGeneration = parseInt(urlQueryHandler.getParameterByName('populationPerGeneration', 100));
        const mutationRate: number = parseFloat(urlQueryHandler.getParameterByName('mutationRate', 0.05));
        const relativeSelectedPopulationPerGeneration: number = parseFloat(urlQueryHandler
            .getParameterByName('relativeSelectedPopulationPerGeneration', 0.05));
        const absoluteSelectedPopulationPerGeneration: number =
            Math.max(Math.ceil(relativeSelectedPopulationPerGeneration * this.populationPerGeneration), 2);
        this.geneticAlgorithm = new GeneticAlgorithm(mutationRate, this.populationPerGeneration, absoluteSelectedPopulationPerGeneration);
        this.simulatedAnnealingAlgorithm = new SimulatedAnnealingAlgorithm();
    }

    public preload(): void {
        this.load.image('splash', './assets/images/gui.png');
    }

    public init(data: {
        results: { attributes: BirdAttributes, duration: number, data: any, id: number }[]
    }): void {
        this.loadCompleted = false;
        this.splashScreen();
        let simulatedAnnealingNextPopulation: Chromosome[] = Array.from(Array(100));

        if (data.results) {
            this.chartEvolutionChart.addLastRoundResults(data.results);
            simulatedAnnealingNextPopulation =
                this.simulatedAnnealingAlgorithm.createNextGeneration(data.results
                    .filter(result => result.attributes === BirdValues.SIMULATED_ANNEALING));
        }
        const geneticNextGeneration = this.getGeneticNextGeneration((data.results || [])
            .filter(result => result.attributes === BirdValues.GENETICALLY_TRAINED)
            .map(result => ({chromosome: result.data, duration: result.duration})));

        this.time.addEvent({
            delay: SplashScene.MIN_SPLASH_TIME,
            callback: () => this.startMainScene(geneticNextGeneration, simulatedAnnealingNextPopulation)
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

    private startMainScene(nextGeneration: Chromosome[], simulatedAnnealingNextPopulation: Chromosome[]) {
        const mainSceneStartFunction = () => this.scene.start('MainScene', {
            geneticBirds: nextGeneration,
            qBirdsNumber: this.qBirdsNumber,
            simulatedAnnealingNextPopulation
        });
        if (this.loadCompleted) {
            mainSceneStartFunction();
        } else {
            this.load.once('complete', () => mainSceneStartFunction());
        }
    }

    private getGeneticNextGeneration(geneticResults: { chromosome: Chromosome; duration: number }[]): Chromosome[] {
        if (geneticResults && geneticResults.length) {
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
