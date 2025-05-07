import { Range } from '../../settings/BirdSettings';


export type NeuralNetworkSettings = {
    inputs: {
        bias: boolean;
        neurons: number;
    };
    hiddenLayers: {
        bias: boolean;
        neurons: Range;
        activationFunction: (x: number) => number;
    }[];
    outputs: {
        neurons: number;
        activationFunction: (x: number) => number;
    };
};
