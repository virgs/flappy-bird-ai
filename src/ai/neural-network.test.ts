import {NeuralNetwork} from './neural-network';

describe('NeuralNetwork', () => {
    it('should creat random brain with correct amount of genes', () => {
        const brain = new NeuralNetwork({
            inputs: [
                {
                    minValue: 0,
                    maxValue: 100,
                },
                {
                    minValue: 50,
                    maxValue: 60,
                }],
            outputs: 2,
            hiddenNeurons: 4
        });
        brain.randomlyGenerateBrain();
        // @ts-expect-error
        expect(brain.config.weights.length).toBe(16);
    });

    it('should fail to do the math when inputs dont match', () => {
        const neuralNetwork = new NeuralNetwork({
            inputs: [
                {
                    minValue: 0,
                    maxValue: 100,
                },
                {
                    minValue: 50,
                    maxValue: 60,
                }],
            outputs: 2,
            hiddenNeurons: 2,
            weights: [.1, .2, .3, .4, .5, .6, .7, .8]
        });
        expect(() => neuralNetwork.doTheMagic(1)).toThrowError();
    });

    it('should normalize values', () => {
        // @ts-expect-error
        expect(NeuralNetwork.normalizeInput({
            minValue: 0,
            maxValue: 100,
        }, 50)).toBe(0.5);
        // @ts-expect-error
        expect(NeuralNetwork.normalizeInput({
            minValue: 1,
            maxValue: 2,
        }, 1.5)).toBe(0.5);
        // @ts-expect-error
        expect(NeuralNetwork.normalizeInput({
            minValue: 50,
            maxValue: 100,
        }, 90)).toBe(0.8);
    });

    it('should do the math', () => {
        const neuralNetwork = new NeuralNetwork({
            inputs: [
                {
                    minValue: 0,
                    maxValue: 100,
                },
                {
                    minValue: 50,
                    maxValue: 60,
                }],
            hiddenNeurons: 2,
            outputs: 1,
            weights: [.1, .2, .3, .4, .5, .6]
        });
        expect(neuralNetwork.doTheMagic(10, 55)[0]).toBeCloseTo(0.17);
    });
});
