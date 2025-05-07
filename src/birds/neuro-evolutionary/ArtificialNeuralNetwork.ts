export type ArtificialNeuralNetworkLayerConfig = {
    bias: boolean
    neurons: number
    activationFunction: (x: number) => number
}

export type ArtificialNeuralNetworkConfig = {
    inputs: {
        bias: boolean
        neurons: number
    }
    hiddenLayers: ArtificialNeuralNetworkLayerConfig[]
    outputs: Omit<ArtificialNeuralNetworkLayerConfig, 'bias'>
    weights: number[]
}

export class ArtificialNeuralNetwork {
    private readonly config: ArtificialNeuralNetworkConfig
    private readonly layers: ArtificialNeuralNetworkLayerConfig[]

    constructor(config: ArtificialNeuralNetworkConfig) {
        this.config = config
        this.layers = [
            { ...this.config.inputs, activationFunction: x => x },
            ...this.config.hiddenLayers,
            { ...this.config.outputs, bias: false },
        ]
        const expected = this.calculateExpectedWeights()
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

            const outputs = this.processLayer(activations, currentWeights, currentLayer.activationFunction)
            weightIndex += prevLayerSize * currentLayer.neurons

            activations = [...outputs]
            if (currentLayer.bias && i !== otherLayers.length - 1) {
                activations.push(1) // Bias neuron except for final layer
            }
        }

        return activations
    }

    private processLayer(input: number[], weights: number[], activationFn: (x: number) => number): number[] {
        const outputNeurons = weights.length / input.length
        const result = new Array(outputNeurons).fill(0)

        for (let i = 0; i < outputNeurons; i++) {
            for (let j = 0; j < input.length; j++) {
                result[i] += input[j] * weights[i * input.length + j]
            }
            result[i] = activationFn(result[i])
        }

        return result
    }

    private calculateExpectedWeights(): number {
        let totalWeights = 0

        for (let i = 0; i < this.layers.length - 1; i++) {
            const inputNeurons = this.layers[i].neurons + (this.layers[i].bias ? 1 : 0)
            const outputNeurons = this.layers[i + 1].neurons
            totalWeights += inputNeurons * outputNeurons
        }

        return totalWeights
    }
}
