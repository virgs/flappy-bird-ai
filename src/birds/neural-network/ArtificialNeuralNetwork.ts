export type ArtificialNeuralNetworkLayerConfig = {
    bias: boolean
    neurons: number
}

export type ArtificialNeuralNetworkInput = {
    inputs: {
        bias: boolean
        neurons: number
    }
    hiddenLayers: ArtificialNeuralNetworkLayerConfig[]
    outputs: Omit<ArtificialNeuralNetworkLayerConfig, 'bias'>
    weights: number[]
}

export class ArtificialNeuralNetwork {
    private readonly config: ArtificialNeuralNetworkInput

    constructor(config: ArtificialNeuralNetworkInput) {
        this.config = config
        const expected = ArtificialNeuralNetwork.calculateExpectedWeights(config)
        if (config.weights.length !== expected) {
            throw new Error(`Expected ${expected} weights, but got ${config.weights.length}.`)
        }
    }

    public getWeights(): number[] {
        return this.config.weights
    }

    public process(inputValues: number[]): number[] {
        if (inputValues.length !== this.config.inputs.neurons) {
            throw new Error(`Input size mismatch. Expected ${this.config.inputs.neurons}, got ${inputValues.length}.`)
        }

        let activations = [...inputValues]
        if (this.config.inputs.bias) {
            activations.push(1) // Bias neuron
        }

        let weightIndex = 0
        const otherLayers = [...this.config.hiddenLayers, { ...this.config.outputs, bias: false }] // Outputs layer do not have bias

        for (let i = 0; i < otherLayers.length; i++) {
            const prevLayerSize = activations.length
            const currentLayer = otherLayers[i]
            const currentWeights = this.config.weights.slice(
                weightIndex,
                weightIndex + prevLayerSize * currentLayer.neurons
            )

            const outputs = this.processLayer(activations, currentWeights)
            weightIndex += prevLayerSize * currentLayer.neurons

            activations = [...outputs]
            if (currentLayer.bias && i !== otherLayers.length - 1) {
                activations.push(1) // Bias neuron except for final layer
            }
        }

        return activations
    }

    private processLayer(input: number[], weights: number[]): number[] {
        const outputNeurons = weights.length / input.length
        const result = new Array(outputNeurons).fill(0)

        for (let i = 0; i < outputNeurons; i++) {
            for (let j = 0; j < input.length; j++) {
                result[i] += input[j] * weights[i * input.length + j]
            }
            result[i] = (x: number) => 1 / (1 + Math.exp(-result[i])) // Sigmoid activation function
        }

        return result
    }

    public static calculateExpectedWeights(ann: Omit<ArtificialNeuralNetworkInput, 'weights'>): number {
        const layers = [
            ann.inputs,
            ...ann.hiddenLayers.map(hiddenLayer => ({ bias: hiddenLayer.bias, neurons: hiddenLayer.neurons })),
            { ...ann.outputs, bias: false }, // Outputs layer do not have bias
        ]
        return layers.reduce((totalWeights, layer, i) => {
            if (i === layers.length - 1) {
                return totalWeights // Skip last layer
            }
            const inputNeurons = layer.neurons + (layer.bias ? 1 : 0)
            const outputNeurons = layers[i + 1].neurons
            return totalWeights + inputNeurons * outputNeurons
        }, 0)
    }
}
