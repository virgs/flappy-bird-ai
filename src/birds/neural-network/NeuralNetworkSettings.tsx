import { Range } from '../../settings/BirdSettings';


export type NeuralNetworkSettings = {
    inputs: {
        bias: boolean;
        neurons: number;
    };
    hiddenLayers: {
        bias: boolean;
        neurons: Range;
    }[];
    outputs: {
        neurons: number;
    };
};
