import { BirdSettings, QTableSettings } from './BirdSettings';


export type GameSettings = {
    human: BirdSettings;
    neuroEvolutionaty: BirdSettings;
    simmulatedAnnealing: BirdSettings;
    qTable: QTableSettings;
};
