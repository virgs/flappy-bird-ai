import {NeuralNetwork} from './neural-network';

describe('NeuralNetwork', () => {
    it('should creat random brain with correct amount of genes', () => {
        const brain = new NeuralNetwork({
            inputs: 2,
            hiddenNeurons: 4,
            outputs: 2
        });
        // @ts-expect-error
        expect(brain.weights.length).toBe(16);
    });

    it('should fail to do the math when inputs dont match', () => {
        const neuralNetwork = new NeuralNetwork({
            inputs: 2,
            hiddenNeurons: 2,
            outputs: 2
        }, [.1, .2, .3, .4, .5, .6, .7, .8, .9, .10]);
        expect(() => neuralNetwork.doTheMagic([1])).toThrowError();
    });

    it('should process layers', () => {
        // @ts-expect-error
        const outputs = NeuralNetwork.processLayer([1, 0], [-10, 30, 0, 2], 2);

        expect(outputs[0]).toBeCloseTo(-1);
        expect(outputs[1]).toBeCloseTo(0);
    });

    it('should do the math', () => {
        const neuralNetwork = new NeuralNetwork({
            inputs: 2,
            hiddenNeurons: 2,
            outputs: 2
        }, [10, -20, 30, -40, 50, -60, 70, -80, 90, -100]);
        const outputs = neuralNetwork.doTheMagic([10, 55]);
        expect(outputs[0]).toBeCloseTo(1);
        expect(outputs[1]).toBeCloseTo(1);
    });
});
