import { ReactNode, useEffect, useState } from 'react';
import { BirdProps } from './game/actors/BirdProps';
import { EventBus, GameEvents } from './game/EventBus';
import { RoundSettings } from './game/round/RoundSettings';
import { BirdTypes, birdTypesList } from './settings/BirdTypes';
import { defaultGameSettings } from './settings/DefaultBirdSettings';
import './HUDGameComponent.scss';


type BirdCounter = {
    alive: number;
    total: number;
};

type BirdTypeCounterType = Record<BirdTypes, BirdCounter>

export const HUDGameComponent = (): ReactNode => {
    const [greatestTotalPopulation, setGreatestTotalPopulation] = useState<number>(0);
    const [birdsCounter, setBirdsCounter] = useState<BirdTypeCounterType>({} as BirdTypeCounterType);
    const [score, setScore] = useState<number>(0);

    useEffect(() => {
        EventBus.on(GameEvents.BIRD_DIED, (bird: BirdProps) => {
            const birdType = bird.getFixture().type as BirdTypes;
            setBirdsCounter(prev => {
                const newCounter = JSON.parse(JSON.stringify(prev));
                if (newCounter[birdType]) {
                    newCounter[birdType].alive -= 1;
                }
                return newCounter;
            });
        });
        EventBus.on(GameEvents.NEW_ROUND_STARTED, (settings: RoundSettings) => {
            let maxTotalPopulation = 0;
            const counter = birdTypesList.reduce((acc, type) => {
                const birdType = type as BirdTypes;
                const totalBirdsOfType = settings.birdSouls.filter(bird => bird.getFixture().type === birdType);
                if (totalBirdsOfType.length > maxTotalPopulation) {
                    maxTotalPopulation = totalBirdsOfType.length;
                }
                acc[birdType] = {
                    alive: totalBirdsOfType.length,
                    total: totalBirdsOfType.length
                }
                return acc
            }, {} as BirdTypeCounterType);
            setGreatestTotalPopulation(maxTotalPopulation);
            setBirdsCounter(counter);
            setScore(0);
        });
        EventBus.on(GameEvents.BIRDS_PASSED_PIPE, () => {
            setScore(prevScore => prevScore + 1);
        });

        return () => {
            EventBus.removeListener(GameEvents.BIRD_DIED);
            EventBus.removeListener(GameEvents.NEW_ROUND_STARTED);
            EventBus.removeListener(GameEvents.BIRDS_PASSED_PIPE);
        }
    }, []);

    const formatBirdCounter = (birdType: BirdTypes, birdCounter: BirdCounter): ReactNode => {
        const totalPopulationDigits = greatestTotalPopulation.toString().length;
        const typeSettings = Object.values(defaultGameSettings).find(setting => setting.birdType === birdType)
        return <div
            key={birdType}
            className='hud-bird-counter-item float-end text-end'
            style={{ color: typeSettings?.cssColor }} >
            {birdCounter.alive}/{birdCounter.total.toString().padStart(totalPopulationDigits, '0')}
        </div>
    }

    return (
        <div className='hud w-100 h-100' style={{ position: 'absolute', left: 0, top: 0 }}
            onPointerDown={() => EventBus.emit(GameEvents.GAME_CONTAINER_POINTER_DOWN, this)}
        >
            <div className='text-center pt-2 text-secondary hud-score'>{score}</div>
            <div className='float-end p-3 text-secondary hud-bird-counter h-100 d-flex flex-column justify-content-end'>
                {
                    Object.entries(birdsCounter)
                        .filter(([_, birdCounter]) => birdCounter.total > 0)
                        .map(([birdType, birdCounter]) => formatBirdCounter(birdType as BirdTypes, birdCounter))
                }
            </div>

        </div>
    );
};
