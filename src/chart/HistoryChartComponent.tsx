import { chartsTooltipClasses, LineSeriesType, ScaleName, XAxis, YAxis } from '@mui/x-charts'
import { AxisValueFormatterContext } from '@mui/x-charts/internals'
import { LineChart } from '@mui/x-charts/LineChart'
import { MakeOptional } from '@mui/x-internals/types'
import { useEffect, useState } from 'react'
import { EventBus, GameEvents } from '../game/EventBus'
import { RoundBirdTypeResult } from '../game/round/RoundHandler'
import { BirdTypes, birdTypesList } from '../settings/BirdTypes'
import { defaultGameSettings } from '../settings/DefaultBirdSettings'
import './HistoryChartComponent.scss'

type ChartDataType = Record<BirdTypes, (BirdTypeResult | undefined)[]>

type BirdTypeResult = {
    best: number
    sum: number
}

const ordinalSuffix = (iteration: number) => {
    const suffixes = ['th', 'st', 'nd', 'rd']
    const value = iteration % 100
    return suffixes[(value - 20) % 10] || suffixes[value] || suffixes[0]
}

const fontFamily = 'var(--flappy-bird-font)'

export const HistoryChartComponent = () => {
    const [roundsResults, setRoundsResults] = useState<RoundBirdTypeResult[]>([])
    const [data, setData] = useState<ChartDataType>({} as ChartDataType)

    const initializeSates = (): void => {
        setData(() =>
            birdTypesList.reduce((acc, type) => {
                acc[type] = []
                return acc
            }, {} as ChartDataType)
        )
        setRoundsResults(() => [])
    }

    useEffect(() => {
        const newLocal = roundsResults.reduce((acc, roundResult) => {
            birdTypesList.forEach(type => {
                const birdType = type as BirdTypes
                const typeResults = roundResult[birdType] as BirdTypeResult
                acc[birdType] = acc[birdType] ? acc[birdType].concat(typeResults) : [typeResults]
            })
            return acc
        }, {} as ChartDataType)
        setData(newLocal)
    }, [roundsResults])

    useEffect(() => {
        EventBus.on(GameEvents.NEW_GAME_STARTED, () => initializeSates())
        EventBus.on(GameEvents.ROUND_BEST_RESULTS, (roundResult: RoundBirdTypeResult) =>
            setRoundsResults(rr => rr.concat(roundResult))
        )
        return () => {
            // Cleanup event listeners on component unmount
            EventBus.removeListener(GameEvents.NEW_GAME_STARTED)
            EventBus.removeListener(GameEvents.ROUND_BEST_RESULTS)
        }
    }, [])

    const getXaxis = (): ReadonlyArray<XAxis<ScaleName>> => {
        if (Object.values(data).length === 0) {
            return []
        }

        return [
            {
                data: Object.values(data)[0].map((_, index) => index),
                label: 'Iterations',
                tickSize: 10,
                tickMinStep: 1,
                tickLabelInterval: (_, index) => index % 5 === 0, // There will be a label every 5 ticks
                valueFormatter: (iteration: number, context: AxisValueFormatterContext<ScaleName>) =>
                    context.location === 'tick'
                        ? iteration.toString()
                        : `${iteration + ordinalSuffix(iteration)} iteration score`,
                height: 60,
                min: 0,
                max: Math.max(...Object.values(data).map(result => result.length)) - 1,
                labelStyle: {
                    fontSize: 20,
                    fontFamily: fontFamily,
                },
                tickLabelStyle: {
                    height: 20,
                    fontFamily: fontFamily,
                    fontSize: 15,
                },
            },
        ]
    }

    const getYAxis = (): ReadonlyArray<YAxis<ScaleName>> => {
        return [
            {
                scaleType: 'linear',
                position: 'right',
                label: 'Pipes',
                tickLabelInterval: () => true, //Every tick has a label
                tickInterval: (_value: number, index: number) => index % 10 === 0, // There will be a tick every 10 pipes
                valueFormatter: (value: number, context: AxisValueFormatterContext<ScaleName>) =>
                    context.location === 'tick' ? value.toString() : `${value} pipes`,
                min: 0,
                width: 50,
                sx: {
                    fontColor: 'red',
                    fontSize: 14,
                    fontFamily: fontFamily,
                },

                labelStyle: {
                    fontSize: 18,
                    fontFamily: fontFamily,
                    angle: 0,
                },
                tickLabelStyle: {
                    fontFamily: fontFamily,
                    fontSize: 12,
                }
            },
        ]
    }

    const getSeries = (): Readonly<MakeOptional<LineSeriesType, 'type'>[]> => {
        if (roundsResults.length === 0) {
            return []
        }

        const activeTypes = roundsResults.reduce((acc, roundResult) => {
            Object.keys(roundResult).forEach(value => {
                acc.add(value as BirdTypes)
            })
            return acc
        }, new Set<BirdTypes>())

        return [...activeTypes]
            .filter(birdType => data[birdType] && data[birdType].length > 0)
            .map(birdType => {
                const settings = Object.values(defaultGameSettings).find(setting => setting.birdType === birdType)
                const name = settings?.label ?? 'Unknown bird type'
                return {
                    curve: 'catmullRom',
                    label: name,
                    name: name,
                    color: settings?.cssColor ?? '#000000',
                    tickLabelStyle: {
                        fontFamily: fontFamily,
                        fontSize: 12,
                    },
                    data: data[birdType].map(result => result?.best ?? null),
                    showMark: false,
                    labelMarkType: 'square',
                }
            })
    }

    return (
        <div
            className={`history-chart d-flex justify-content-center 
            align-items-center w-100 ${roundsResults.length === 0 ? 'd-none' : 'show'}`}>
            <LineChart
                slotProps={{
                    legend: {
                        sx: {
                            fontSize: 14,
                            fontFamily: fontFamily,
                        },
                    },
                    tooltip: {
                        sx: {
                            [`&.${chartsTooltipClasses.root} .${chartsTooltipClasses.table} caption`]: {
                                fontFamily: fontFamily,
                                fontSize: 18,
                                textAlign: 'center',
                            },
                            [`&.${chartsTooltipClasses.root} .${chartsTooltipClasses.cell}`]: {
                                fontFamily: fontFamily,
                            },
                        },
                    },
                }}
                sx={{
                    width: '100%',
                    height: '100%',
                    fontFamily: fontFamily,
                }}
                series={getSeries()}
                xAxis={getXaxis()}
                yAxis={getYAxis()}
                grid={{ horizontal: true }}
                height={200}
            />
        </div>
    )
}
