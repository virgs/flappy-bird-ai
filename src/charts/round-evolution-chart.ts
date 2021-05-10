import {BirdType} from '../actors/birds/bird';

export class RoundEvolutionChart {
    private readonly chartOptions: any;
    private readonly geneticLongestData: number[] = [0];
    private readonly geneticAverageData: number[] = [0];
    private readonly playerData: number[] = [0];
    private readonly qTableData: number[] = [0];
    private readonly chart: any = null;

    public constructor() {
        this.chartOptions = {
            chart: {
                type: 'spline'
            },
            title: {
                text: 'Performance by Round'
            },
            xAxis: {
                min: 1,
                title: {
                    text: 'Round'
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
                    name: 'Genetic best',
                    color: '#FFC200',
                    lineWidth: 1,
                    marker: {
                        enabled: false
                    },
                    data: this.geneticLongestData
                },
                {
                    name: 'Genetic average',
                    color: '#181202',
                    lineWidth: 1,
                    marker: {
                        enabled: false
                    },
                    data: this.geneticAverageData
                },
                {
                    name: `Player`,
                    color: '#00B5C2',
                    lineWidth: 1,
                    marker: {
                        enabled: false
                    },
                    data: this.playerData
                },
                {
                    name: 'Best QBird',
                    color: '#00E852',
                    lineWidth: 1,
                    marker: {
                        enabled: false
                    },
                    data: this.qTableData
                }]
        };
        // @ts-expect-error
        this.chart = Highcharts.chart('generations-evolution-chart-container', this.chartOptions);
    }

    public addLastRoundResult(results: { type: BirdType; duration: number, data: any }[]): void {
        const geneticResult = results
            .filter(result => result.type === BirdType.GENETICALLY_TRAINED);
        const geneticSortedResult = geneticResult
            .sort((a, b) => a.duration - b.duration);

        const bestGeneticTrainedCitizen = geneticSortedResult[geneticSortedResult.length - 1];
        const geneticLongestDuration = bestGeneticTrainedCitizen.duration / 1000;
        this.geneticLongestData.push(parseFloat(geneticLongestDuration.toFixed(2)));

        const geneticAverageDuration = geneticSortedResult
            .reduce((acc, result) => acc + result.duration, 0) / (1000 * geneticSortedResult.length);
        this.geneticAverageData.push(parseFloat(geneticAverageDuration.toFixed(2)));

        const playerResult = results
            .find(result => result.type === BirdType.PLAYER_CONTROLLED).duration / 1000;
        this.playerData.push(parseFloat(playerResult.toFixed(2)));

        const qBirdsBest = results
            .filter(result => result.type === BirdType.Q_TABLE)
            .reduce((acc, result) => acc > result.duration ? acc: result.duration, 0) / 1000;
        this.qTableData.push(parseFloat(qBirdsBest.toFixed(2)));

        this.chartOptions.xAxis.max = Math.ceil(this.geneticLongestData.length * 1.25);
        this.chart.update(this.chartOptions);
    }
}
