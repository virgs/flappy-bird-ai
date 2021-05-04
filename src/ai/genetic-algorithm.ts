export class GeneticAlgorithm {
    private readonly populationPerGeneration: number = 30;
    private readonly selectedPopulationPerGeneration: number = 2;
    private generationCounter: number = 0;

    public randomlyGenerate() {

    }

    //{genes: options, result: this.sceneDuration}[]
    public generateNextGeneration(birdsDuration: any[]): any {
        ++this.generationCounter;

        // console.log(birdsDuration
        //     .reduce((acc, item) => acc + item.sceneDuration, 0) / birdsDuration.length);
        return Array.from(Array(this.selectedPopulationPerGeneration));
    }
}
