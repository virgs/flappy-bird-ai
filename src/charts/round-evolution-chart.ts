import {BirdAttributes, BirdValues} from '../actors/birds/bird-attributes';

export class RoundEvolutionChart {
    private readonly chartOptions: any;
    private readonly series: any[];
    private readonly chart: any = null;

    public constructor() {
        this.series = Object.keys(BirdValues)
            .map(value => {
                return {
                    name: BirdValues[value].name,
                    color: BirdValues[value].color,
                    lineWidth: 1,
                    marker: {
                        enabled: false
                    },
                    data: [0]
                };
            });
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
            series: this.series
        };

        // @ts-expect-error
        this.chart = Highcharts.chart('generations-evolution-chart-container', this.chartOptions);
    }

    public addLastRoundResults(results: { attributes: BirdAttributes; duration: number; data: any; id: number }[]): void {
        const bestResults: { [name: string]: number } = Object.values(BirdValues)
            .reduce((acc, value) => {
                acc[value.name] = 0;
                return acc;
            }, {} as { [name: string]: number });

        results
            .forEach(result => {
                if (result.duration > bestResults[result.attributes.name]) {
                    bestResults[result.attributes.name] = result.duration;
                }
            });
        this.series
            .forEach(serie => {
                const resultInSeconds: number = bestResults[serie.name] / 1000;
                serie.data.push(parseFloat(resultInSeconds.toFixed(2)));
            });

        this.chartOptions.xAxis.max = Math.ceil(this.series[0].data.length * 1.25);
        this.chart.update(this.chartOptions);
    }
}
