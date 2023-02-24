# flappy-bird-ai

![screenshot](./screenshot.png)

This project was created for fun and studying purposes.
These were the mains goals behind it:

1. Use the _Reactive Message Orientation Object Orientation_. A paradigm I conceived to try to reflect [Reactive System](https://www.reactivemanifesto.org/) design in a OO level to get the hang of it and get used to the difficulties that may occur.
    To do this, I elaborated two ground rules:

    - __Message oriented object communication__: no public methods. Every communication has to be through a message mechanism (Event emitters) and serializable objects (dto, vo, and others). Objects are not aware of each other.
    - __Stateless messages__: the messages should include every information it needs, so the receivers process them accordingly.

1. Study NeuroEvolutionary algorithms. A combination of [Neural Network](./src/ai/neural-network.ts) and [Genetic Algorithms](./src/ai/genetic-algorithm.ts). The idea is to find a mathematical function that receives inputs (bird y position, the closest pipe gap x position, the closest pipe gap y position) and results in a single output (should jump?). After that, select the best citizens of every generation and create a new generation based exclusively on this and operations such as _crossover_ and _mutations_.

1. Study [Reinforcement Learning (q-learning)](./src/actors/birds/bird-q.ts). An _agent_ (i.e. the bird) takes in a state and a reward from the environment, and based on these variables, the agent chooses the optimal action (flap/not to flap).

1. Study [Simulated annealing](./src/ai/simulated-annealing-algorithm.ts). [Wikipedia](https://en.wikipedia.org/wiki/Simulated_annealing). Specifically, it is a metaheuristic to approximate global optimization in a large search space for an optimization problem.

1. Have fun. Yay.

If you want to, [you can watch it live or/and defy the AI](https://virgs.github.io/flappy-bird-ai?mutationRate=0.01&populationPerGeneration=1500&relativeSelectedPopulationPerGeneration=0.01&qBirdsNumber=100). I should warn you, it's not a good idea.

Remember to control the __BLUE__ one (press SPACE BAR to jump and ESC to reinitialize round). Feel free to mess around with the __url query params__ (Defaults to: mutationRate=0.01&populationPerGeneration=1500&relativeSelectedPopulationPerGeneration=0.01&qBirdsNumber=100)

![Preview](./preview.gif)
