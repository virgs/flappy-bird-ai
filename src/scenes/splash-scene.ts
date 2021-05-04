import {GeneticAlgorithm} from '../ai/genetic-algorithm';

export class SplashScene extends Phaser.Scene {
    private static readonly MIN_TIME: 10;

    private geneticAlgorithm: GeneticAlgorithm = new GeneticAlgorithm();
    private loadCompleted: boolean;

    constructor() {
        super({
            key: 'SplashScene'
        });
        this.loadCompleted = false;
    }

    public preload(): void {
        this.load.image('splash', './assets/images/gui.png');
    }

    public init(data: {
        results: any[]
    }): void {
        console.log('splash: ' + JSON.stringify(data));
        const nextGeneration = data.results ? this.geneticAlgorithm.randomlyGenerate() : this.geneticAlgorithm.generateNextGeneration(data.results);
        const logo = this.add.sprite(this.game.renderer.width / 2, this.game.renderer.height / 2, 'splash');
        let scaleRatio = Math.min(window.innerWidth / logo.getBounds().width, window.innerHeight / logo.getBounds().height);
        logo.setScale(scaleRatio, scaleRatio);

        this.loadImages();
        this.loadFonts();
        this.load.start();
        this.load.on('complete', () => this.loadCompleted = true);

        this.time.addEvent({
            delay: SplashScene.MIN_TIME,
            callback: () => {
                const mainSceneStart = () => this.scene.start('MainScene', {
                    birds: nextGeneration
                });
                if (this.loadCompleted) {
                    mainSceneStart();
                } else {
                    this.load.on('complete', () => mainSceneStart());
                }
            }
        });

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

    private loadFonts() {
        this.load.bitmapFont('scoreFont',
            `./assets/fonts/PressStart2P-Regular.png`,
            `./assets/fonts/PressStart2P-Regular.fnt`);
    }

}
