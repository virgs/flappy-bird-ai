import { useEffect, useState } from 'react'
import Col from 'react-bootstrap/Col'
import Form from 'react-bootstrap/Form'
import Row from 'react-bootstrap/Row'
import { ArtificialNeuralNetworkComponent } from '../neural-network/ArtificialNeuralNetworkComponent'
import { GeneticAlgorithmSettings } from './GeneticAlgorithmSettings'

type GeneticAlgorithmComponentProps = {
    value: GeneticAlgorithmSettings
    onChange: (data: GeneticAlgorithmSettings) => void
}

export const GeneticAlgorithmComponent = (props: GeneticAlgorithmComponentProps) => {
    const [settings, setSettings] = useState<GeneticAlgorithmSettings>(props.value)

    useEffect(() => {
        if (JSON.stringify(settings) === JSON.stringify(props.value)) {
            return
        }
        setSettings(props.value)
    }, [props.value])

    useEffect(() => {
        props.onChange(settings)
    }, [settings])

    return (
        <>
            <div className="fs-5 mx-2 my-3">
                <strong>Genetic Algorithm</strong> is what happens when computer scientists get inspired by nature and
                think, “What if we let a bunch of digital creatures struggle, reproduce, and mutate until one of them
                accidentally gets it right?” Instead of survival of the fittest, it’s more like survival of the least
                terrible. This game uses that very approach to evolve neural networks — because nothing says 'progress'
                like blindly stumbling through generations of failure. Learn more about this charming chaos{' '}
                <a href="https://en.wikipedia.org/wiki/Genetic_algorithm" target="_blank" rel="noreferrer">
                    here
                </a>
                .
            </div>
            <Row className="gx-4 justify-content-between align-items-center form-row">
                <Col xs={12}>
                    <div className="fs-2 text-center mb-2">Genetic Algorithm</div>
                </Col>
                <Col xs={12} md={6}>
                    <Form.Label className="fs-3">
                        Population: <strong>{settings.totalPopulation.value}</strong>
                    </Form.Label>
                    <Form.Range
                        min={settings.totalPopulation.min}
                        max={settings.totalPopulation.max}
                        step={settings.totalPopulation.step}
                        value={settings.totalPopulation.value}
                        onChange={e => {
                            const newSettings = { ...settings }
                            newSettings.totalPopulation.value = parseFloat(e.target.value)
                            setSettings(newSettings)
                        }}
                    />
                </Col>
                <Col xs={12} md={6}>
                    <Form.Label className="fs-3">
                        Mutation Rate: <strong>{settings.geneticAlgorithm.mutationRate.value}</strong>
                    </Form.Label>
                    <Form.Range
                        min={settings.geneticAlgorithm.mutationRate.min}
                        max={settings.geneticAlgorithm.mutationRate.max}
                        step={settings.geneticAlgorithm.mutationRate.step}
                        value={settings.geneticAlgorithm.mutationRate.value}
                        onChange={e => {
                            const newSettings = { ...settings }
                            newSettings.geneticAlgorithm.mutationRate.value = parseFloat(e.target.value)
                            setSettings(newSettings)
                        }}
                    />
                </Col>
                <Col xs={12} md={6}>
                    <Form.Label className="fs-3">
                        Crossovers Cuts: <strong>{settings.geneticAlgorithm.crossoversCuts.value}</strong>
                    </Form.Label>
                    <Form.Range
                        min={settings.geneticAlgorithm.crossoversCuts.min}
                        max={settings.geneticAlgorithm.crossoversCuts.max}
                        step={settings.geneticAlgorithm.crossoversCuts.step}
                        value={settings.geneticAlgorithm.crossoversCuts.value}
                        onChange={e => {
                            const newSettings = { ...settings }
                            newSettings.geneticAlgorithm.crossoversCuts.value = parseFloat(e.target.value)
                            setSettings(newSettings)
                        }}
                    />
                </Col>
                <Col xs={12} md={6}>
                    <Form.Label className="fs-3">
                        Elitism Ratio: <strong>{settings.geneticAlgorithm.elitismRatio.value}</strong>
                    </Form.Label>
                    <Form.Range
                        min={settings.geneticAlgorithm.elitismRatio.min}
                        max={settings.geneticAlgorithm.elitismRatio.max}
                        step={settings.geneticAlgorithm.elitismRatio.step}
                        value={settings.geneticAlgorithm.elitismRatio.value}
                        onChange={e => {
                            const newSettings = { ...settings }
                            newSettings.geneticAlgorithm.elitismRatio.value = parseFloat(e.target.value)
                            setSettings(newSettings)
                        }}
                    />
                </Col>
            </Row>
            <ArtificialNeuralNetworkComponent
                value={settings.artificialNeuralNetwork}
                onChange={newSettings => {
                    const updatedSettings = { ...settings }
                    updatedSettings.artificialNeuralNetwork = newSettings
                    setSettings(updatedSettings)
                }}
            />
        </>
    )
}
