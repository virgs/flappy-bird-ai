import { chartsTooltipClasses, LineSeriesType, ScaleName, ShowMarkParams, XAxis, YAxis } from '@mui/x-charts';
import { AxisValueFormatterContext } from '@mui/x-charts/internals';
import { LineChart } from '@mui/x-charts/LineChart';
import { MakeOptional } from '@mui/x-internals/types';
import { useEffect, useState } from 'react';
import { EventBus, GameEvents } from '../game/EventBus';
import { RoundBirdTypeResult } from '../game/round/RoundHandler';
import { BirdTypes, birdTypesList } from "../settings/BirdTypes";
import { defaultGameSettings } from '../settings/DefaultBirdSettings';
import "./HistoryChartComponent.scss";

type ChartDataType = Record<BirdTypes, (BirdTypeResult | undefined)[]>;

type BirdTypeResult = {
    best: number;
    sum: number;
};


export const HistoryChartComponent = () => {
    const [roundsResults, setRoundsResults] = useState<RoundBirdTypeResult[]>([]);
    const [data, setData] = useState<ChartDataType>(({} as ChartDataType));

    const initializeSates = (): void => {
        setData(() => birdTypesList.reduce((acc, type) => {
            acc[type] = [];
            return acc;
        }, {} as ChartDataType));
        setRoundsResults(() => []);
    }

    useEffect(() => {
        const newLocal = roundsResults.reduce((acc, roundResult) => {
            birdTypesList.forEach((type) => {
                const birdType = type as BirdTypes;
                const typeResults = roundResult[birdType] as BirdTypeResult;
                acc[birdType] = acc[birdType] ? acc[birdType].concat(typeResults) : [typeResults];
            });
            return acc;
        }, {} as ChartDataType);
        setData(newLocal);
    }, [roundsResults])

    useEffect(() => {
        EventBus.on(GameEvents.NEW_GAME_STARTED, () => initializeSates());
        EventBus.on(GameEvents.ROUND_BEST_RESULTS, (roundResult: RoundBirdTypeResult) => setRoundsResults((rr) => rr.concat(roundResult)));
        return () => {
            // Cleanup event listeners on component unmount
            EventBus.removeListener(GameEvents.NEW_GAME_STARTED);
            EventBus.removeListener(GameEvents.ROUND_BEST_RESULTS);
        };
    }, []);


    const getXaxis = (): ReadonlyArray<XAxis<ScaleName>> => {
        if (Object.values(data).length === 0) {
            return []
        }

        return [{
            data: Object.values(data)[0].map((_, index) => index),
            label: 'Iterations',
            tickMinStep: 5,
            tickSize: 3,
            // tickLabelInterval: (value, index) => index % 2 === 0,
            valueFormatter: (value: number, context: AxisValueFormatterContext<ScaleName>) => `Score X axis`,
            min: 0,
            max: Math.max(...Object.values(data).map((result) => result.length)) - 1,
            labelStyle: {
                fontSize: 18,
                fontFamily: 'var(--flappy-bird-font)',
            },
            tickLabelStyle: {
                fontFamily: 'var(--flappy-bird-font)',
                angle: 45,
                fontSize: 15,
            },
        }];
    }


    const getYAxis = (): ReadonlyArray<YAxis<ScaleName>> => {
        return [
            {
                scaleType: 'linear',
                position: 'right',
                label: 'Score',
                labelStyle: {
                    fontSize: 18,
                    fontFamily: 'var(--flappy-bird-font)',
                    angle: 0,
                },
                tickLabelStyle: {
                    fontFamily: 'var(--flappy-bird-font)',
                    fontSize: 12,
                },
                tickLabelInterval: (_, index) => index % 2 === 0,
            },
        ];
    }


    const getSeries = (): Readonly<MakeOptional<LineSeriesType, 'type'>[]> => {
        const activeTypes = roundsResults.reduce((acc, roundResult) => {
            Object.keys(roundResult).forEach((value) => {
                acc.add(value as BirdTypes);
            })
            return acc;
        }, new Set<BirdTypes>())

        return [...activeTypes]
            .filter((birdType) => data[birdType] && data[birdType].length > 0)
            .map(birdType => {
                const settings = Object.values(defaultGameSettings).find((setting) => setting.birdType === birdType)
                const name = settings?.label ?? 'Unknown bird type';
                return {
                    curve: "catmullRom",
                    label: name,
                    name: name,
                    color: settings?.cssColor ?? '#000000',
                    tickLabelStyle: {
                        fontFamily: 'var(--flappy-bird-font)',
                        fontSize: 12,
                    },
                    data: data[birdType].map((result) => result?.best ?? null),
                    // showMark: (item: ShowMarkParams) => item.index % 10 === 0,
                    labelMarkType: 'square',
                }
            })
    }


    return (
        <div className="history-chart">
            <p className="fs-1">History Chart</p>
            <LineChart
                slotProps={{
                    legend: {
                        sx: {
                            fontSize: 14,
                            fontFamily: 'var(--flappy-bird-font)',
                        },
                    },
                    tooltip: {
                        sx: {
                            // [`&.${chartsTooltipClasses.root} .${chartsTooltipClasses.valueCell}`]: {
                            //     color: 'red',
                            //     fontFamily: 'var(--flappy-bird-font)',
                            // },
                            // [`&.${chartsTooltipClasses.root} .${chartsTooltipClasses.labelCell}`]: {
                            //     color: 'blue',
                            //     fontFamily: 'var(--flappy-bird-font)',
                            // },
                            // [`&.${chartsTooltipClasses.root} .${chartsTooltipClasses.mark}`]: {
                            //     color: 'green',
                            //     fontFamily: 'var(--flappy-bird-font)',
                            // },
                            // [`&.${chartsTooltipClasses.root} .${chartsTooltipClasses.markContainer}`]: {
                            //     color: 'green',
                            //     fontFamily: 'var(--flappy-bird-font)',
                            // },
                            // [`&.${chartsTooltipClasses.root} .${chartsTooltipClasses.table}`]: {
                            //     color: 'green',
                            //     fontFamily: 'var(--flappy-bird-font)',
                            // },
                            // [`&.${chartsTooltipClasses.root} .${chartsTooltipClasses.axisValueCell}`]: {
                            //     color: 'green',
                            //     fontFamily: 'var(--flappy-bird-font)',
                            // },
                            [`&.${chartsTooltipClasses.root} .${chartsTooltipClasses.cell}`]: {
                                color: 'purple',
                                fontFamily: 'var(--flappy-bird-font)',
                            },
                            // [`&.${chartsTooltipClasses.root} .${chartsTooltipClasses.paper}`]: {
                            //     color: 'pink',
                            //     fontFamily: 'var(--flappy-bird-font)',
                            // },
                            // [`&.${chartsTooltipClasses.root} .${chartsTooltipClasses.row}`]: {
                            //     color: 'pink',
                            //     fontFamily: 'var(--flappy-bird-font)',
                            // },
                        },
                    },
                }}
                sx={{
                    height: '300px',

                }}
                series={getSeries()}
                xAxis={getXaxis()}
                yAxis={getYAxis()}
                grid={{ horizontal: true }}

            // height={300}
            />

        </div>
    )

}