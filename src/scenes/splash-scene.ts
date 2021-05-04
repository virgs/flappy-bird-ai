export class SplashScene extends Phaser.Scene {

    private static readonly MIN_TIME: 250;
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

    public create(): void {
        const logo = this.add.sprite(this.game.renderer.width / 2, this.game.renderer.height / 2, 'splash');
        let scaleRatio = Math.min(window.innerWidth / logo.getBounds().width, window.innerHeight / logo.getBounds().height);
        logo.setScale(scaleRatio, scaleRatio);

        this.loadImages();
        this.loadFonts();
        this.load.start();
        this.load.on('complete', () => this.loadCompleted = true);

        this.time.addEvent({
            delay: SplashScene.MIN_TIME, callback: () => {
                if (this.loadCompleted) {
                    this.scene.start('MainScene');
                } else {
                    this.load.on('complete', () => this.scene.start('MainScene'));
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
