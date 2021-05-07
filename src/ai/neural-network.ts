type NeuralNetworkInput = {
    minValue: number;
    maxValue: number;
};

type NeuralNetworkConfig = {
    inputs: NeuralNetworkInput[],
    outputs: number,
    hiddenNeurons: number,
    weights?: number[]
};

export class NeuralNetwork {
    private readonly config: NeuralNetworkConfig;

    public constructor(config: NeuralNetworkConfig) {
        this.config = config;
        const genesAmount = this.config.inputs.length * this.config.hiddenNeurons + this.config.hiddenNeurons * this.config.outputs;
        if (this.config.weights && this.config.weights.length !== genesAmount) {
            throw new Error(`Wrong number of genes '${this.config.weights.length}'. Correct value should be '${genesAmount}' [hiddenNeurons * (inputs + outputs)]`);
        }
    }

    public randomlyGenerateBrain(): number[] {
        const genesAmount = this.config.inputs.length * this.config.hiddenNeurons + this.config.hiddenNeurons * this.config.outputs;
        this.config.weights = Array.from(Array(genesAmount)).map(() => -100 + Math.random() * 200);
        return this.config.weights;
    }

    public doTheMagic(...inputValues: number[]): number[] {
        if (inputValues.length !== this.config.inputs.length) {
            throw new Error(`Amount of function argument '${inputValues.length}' should match configuration inputs quantity '${this.config.inputs.length}'`);
        }
        const hiddenNeurons = this.config.hiddenNeurons;
        // const normalizedInputValue = inputValues
        //     .map((value, index) => NeuralNetwork.normalizeInput(this.config.inputs[index], value));
        const hiddenNeuronsMath = this.config.weights
            .reduce((acc, weight, index) => {
                const normalizedInputValueWeighted = inputValues[index % inputValues.length] * weight;
                if (acc[index % hiddenNeurons]) {
                    acc[index % hiddenNeurons] += normalizedInputValueWeighted;
                } else {
                    acc[index % hiddenNeurons] = normalizedInputValueWeighted;
                }
                return acc;
            }, [])
            .map(neuron => Math.tanh(neuron / hiddenNeurons));

        const outputs = this.config.outputs;
        const zeroedOutputs = Array.from(Array(outputs)).map(() => 0);
        return hiddenNeuronsMath.reduce((acc, hiddenNeuronValue, index) => {
            acc[index % outputs] += hiddenNeuronValue;
            return acc;
        }, zeroedOutputs)
            .map(outputValue => Math.tanh(outputValue));
    }

    private static normalizeInput(input: NeuralNetworkInput, value: number) {
        if (value > input.maxValue) {
            return 1;
        }
        if (value < input.minValue) {
            return 0;
        }
        return (value - input.minValue) / (input.maxValue - input.minValue);
    }

}
