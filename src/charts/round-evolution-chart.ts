import {BirdType} from '../actors/birds/bird';

export class RoundEvolutionChart {
    private readonly chartOptions: any;
    private readonly longestData: number[] = [0];
    private readonly playerData: number[] = [0];
    private readonly playerTrainedData: number[] = [0];
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
                    name: 'Genetic',
                    color:  '#FFC200',
                    lineWidth: 1,
                    marker: {
                        enabled: false
                    },
                    data: this.longestData
                },
                {
                    name: `Player`,
                    color:  '#00B5C2',
                    lineWidth: 1,
                    marker: {
                        enabled: false
                    },
                    data: this.playerData
                },
                {
                    name: 'Player trained',
                    color:  '#00E852',
                    lineWidth: 1,
                    marker: {
                        enabled: false
                    },
                    data: this.playerTrainedData
                }]
        };
        // @ts-expect-error
        this.chart = Highcharts.chart('generations-evolution-chart-container', this.chartOptions);
    }

    public addLastRoundResult(results: { type: BirdType; duration: number }[]): void {
        const geneticResult = results
            .filter(result => result.type === BirdType.GENETICALLY_TRAINED);
        const geneticSortedResult = geneticResult
            .sort((a, b) => a.duration - b.duration);

        const bestGeneticTrainedCitizen = geneticSortedResult[geneticSortedResult.length - 1];
        const geneticLongestDuration = bestGeneticTrainedCitizen.duration / 1000;
        this.longestData.push(parseFloat(geneticLongestDuration.toFixed(2)));

        const playerResult = results
            .find(result => result.type === BirdType.PLAYER_CONTROLLED).duration / 1000;
        this.playerData.push(parseFloat(playerResult.toFixed(2)));

        const playerTrainedResult = results
            .find(result => result.type === BirdType.PLAYER_TRAINED).duration / 1000;
        this.playerTrainedData.push(parseFloat(playerTrainedResult.toFixed(2)));

        this.chartOptions.xAxis.max = Math.ceil(this.longestData.length * 1.25);
        this.chart.update(this.chartOptions);
    }
}
