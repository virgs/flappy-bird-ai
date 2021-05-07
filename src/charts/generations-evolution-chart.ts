import {Chromosome} from '../actors/chromosome';

export class GenerationsEvolutionChart {
    private readonly chartOptions: any;
    private readonly longestData: number[] = [0];
    private readonly averageData: number[] = [0];
    private readonly selectedGroupAverage: number[] = [0];
    private readonly selectedPopulationPerGeneration: number;
    private readonly chart: any = null;

    public constructor(selectedPopulationPerGeneration: number) {
        this.chartOptions = {
            chart: {
                type: 'spline'
            },
            title: {
                text: 'Performance by Generation'
            },
            xAxis: {
                min: 1,
                title: {
                    text: 'Generation'
                }
            },
            yAxis: {
                min: 0,
                title: {
                    text: 'Duration'
                },
                labels: {
                    formatter: function () {
                        return this.value + 's';
                    }
                }
            },
            tooltip: {
                crosshairs: true,
                shared: true
            },
            plotOptions: {
                spline: {
                    lineWidth: 4,
                    states: {
                        hover: {
                            lineWidth: 5
                        }
                    },
                    marker: {
                        enabled: true
                    },
                }
            },
            series: [
                {
                    name: 'Best citizen',
                    lineWidth: 1,
                    marker: {
                        enabled: false
                    },
                    data: this.longestData
                },
                {
                    name: `Top ${selectedPopulationPerGeneration} average`,
                    lineWidth: 1,
                    marker: {
                        enabled: false
                    },
                    data: this.selectedGroupAverage
                },
                {
                    name: 'Average',
                    lineWidth: 1,
                    marker: {
                        enabled: false
                    },
                    data: this.averageData
                }]
        };
        // @ts-expect-error
        this.chart = Highcharts.chart('generations-evolution-chart-container', this.chartOptions);
        this.selectedPopulationPerGeneration = selectedPopulationPerGeneration;
    }

    public addGenerationResult(results: { chromosome: Chromosome; duration: number }[]): void {
        const sortResults = results
            .sort((a, b) => a.duration - b.duration);

        const bestCitizen = sortResults[sortResults.length - 1];
        console.log(JSON.stringify(bestCitizen.chromosome.genes));
        const longestDuration = bestCitizen.duration / 1000;
        const selectedGroupAverage = sortResults
            .filter((_, index) => index > sortResults.length - this.selectedPopulationPerGeneration)
            .reduce((acc, item) => acc + item.duration / this.selectedPopulationPerGeneration, 0) / 1000;
        const generationAverage = sortResults
            .reduce((acc, item) => acc + item.duration / sortResults.length, 0) / 1000;
        this.selectedGroupAverage.push(parseFloat(selectedGroupAverage.toFixed(2)));
        this.longestData.push(parseFloat(longestDuration.toFixed(2)));
        this.averageData.push(parseFloat(generationAverage.toFixed(2)));
        this.chartOptions.xAxis.max = Math.ceil(this.averageData.length * 1.25);
        this.chart.update(this.chartOptions);
    }
}
