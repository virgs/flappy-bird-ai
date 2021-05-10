# flappy-bird-ai

This project was created for fun and studying purposes.
There were four mains goals behind it:

1. Use the _Reactive Message Orientation Object Orientation_. A paradigm I conceived to try to reflect [Reactive System](https://www.reactivemanifesto.org/) design in a OO level to get the hang of it and get used to the difficulties that may occur.
    To do this, I elaborated two ground rules:

    - __Message oriented object communication__: no public methods besides. Every communication has to be through a message mechanism (Event emitters) and serializable objects (dto, vo, and others). Objects are not aware of each other.
    - __Stateless messages__: the messages should include every information it needs, so the receivers process them accordingly.

2. Study [Neural Network](./src/ai/neural-network.ts). Find a mathematical function that receives inputs (bird y position, the closest pipe gap x position, the closest pipe gap y position) and results in a single output (should jump?).

3. Study [Genetic Algorithms](./src/ai/genetic-algorithm.ts). Select the best citizens of every generation and create a new generation based exclusively on this and operations such as _crossover_ and _mutations_.

4. Have fun. Yay.

The idea is to randomly generates breeds of birds neural networks and combine the best of them to evolve through time. It usually finds a good neural network before the 5th generation.

If you want to, [you can watch it live or/and defy the AI](https://virgs.github.io/flappy-bird-ai?mutationRate=0.01&populationPerGeneration=1500&relativeSelectedPopulationPerGeneration=0.01) . Remember to control the __BLUE__ one (press SPACE BAR to jump and ESC to reinitialize round). Feel free to mess around with the __url query params__ (Defaults to: mutationRate=0.01&populationPerGeneration=1500&relativeSelectedPopulationPerGeneration=0.01)

![Preview](./preview.gif)
