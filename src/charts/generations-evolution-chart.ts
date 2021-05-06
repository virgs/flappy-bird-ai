import {Chromosome} from '../actors/chromosome';

export class GenerationsEvolutionChart {
    private readonly chartOptions: any;
    private readonly longestData: number[] = [0];
    private readonly averageData: number[] = [0];
    private chart: any = null;

    public constructor() {
        this.chartOptions = {
            chart: {
                type: 'spline'
            },
            title: {
                text: 'Performance By Generation'
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
                    text: 'Duration (s)'
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
                    name: 'Longest duration',
                    data: this.longestData
                }, {
                    name: 'Average',
                    data: this.averageData
                }]
        };
        // @ts-ignore
        this.chart = Highcharts.chart('generations-evolution-chart-container', this.chartOptions);
    }

    public addGenerationResult(results: { chromosome: Chromosome; duration: number }[]): void {
        const longestDuration = results[results.length - 1].duration / 1000;
        const average = results
            .reduce((acc, item) => acc + item.duration / results.length, 0) / 1000;
        this.longestData.push(parseInt(longestDuration.toFixed(2)));
        this.averageData.push(parseInt(average.toFixed(2)));
        this.chartOptions.xAxis.max = Math.ceil(this.averageData.length * 1.25);
        this.chart.update(this.chartOptions);
    }
}
