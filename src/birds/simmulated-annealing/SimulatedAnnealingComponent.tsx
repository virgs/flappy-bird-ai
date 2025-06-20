import { useEffect, useState } from 'react'
import Col from 'react-bootstrap/Col'
import Form from 'react-bootstrap/Form'
import Row from 'react-bootstrap/Row'
import { ArtificialNeuralNetworkComponent } from '../neural-network/ArtificialNeuralNetworkComponent'
import { SimulatedAnnealingSettings } from './SimulatedAnnealingSettings'

type SimulatedAnnealingComponentProps = {
    value: SimulatedAnnealingSettings
    onChange: (data: SimulatedAnnealingSettings) => void
}

export const SimulatedAnnealingComponent = (props: SimulatedAnnealingComponentProps) => {
    const [settings, setSettings] = useState<SimulatedAnnealingSettings>(props.value)

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
                <strong>Simulated Annealing</strong> is what happens when an algorithm decides it's okay to make bad
                decisions — as long as it’s still early and the metaphorical metal is hot. Inspired by metallurgy
                (because of course it is), this method wanders around the solution space, occasionally tripping on worse
                answers in the hope that they eventually lead somewhere better. This game uses that very strategy to
                train neural networks, because sometimes the best path forward is to get lost on purpose. Learn more
                about this controlled chaos{' '}
                <a href="https://en.wikipedia.org/wiki/Simulated_annealing" target="_blank" rel="noreferrer">
                    here
                </a>
                .
            </div>
            <Row className="gx-4 justify-content-between align-items-center form-row">
                <Col xs={12}>
                    <div className="fs-2 text-center mb-2">Simmulated Annealing</div>
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
                        Initial Temperature: <strong>{settings.simulatedAnnealing.initialTemperature.value}</strong>
                    </Form.Label>
                    <Form.Range
                        min={settings.simulatedAnnealing.initialTemperature.min}
                        max={settings.simulatedAnnealing.initialTemperature.max}
                        step={settings.simulatedAnnealing.initialTemperature.step}
                        value={settings.simulatedAnnealing.initialTemperature.value}
                        onChange={e => {
                            const newSettings = { ...settings }
                            newSettings.simulatedAnnealing.initialTemperature.value = parseFloat(e.target.value)
                            setSettings(newSettings)
                        }}
                    />
                </Col>
                <Col xs={12} md={6}>
                    <Form.Label className="fs-3">
                        Temperature Decrease Rate:{' '}
                        <strong>{settings.simulatedAnnealing.temperatureDecreaseRate.value}</strong>
                    </Form.Label>
                    <Form.Range
                        min={settings.simulatedAnnealing.temperatureDecreaseRate.min}
                        max={settings.simulatedAnnealing.temperatureDecreaseRate.max}
                        step={settings.simulatedAnnealing.temperatureDecreaseRate.step}
                        value={settings.simulatedAnnealing.temperatureDecreaseRate.value}
                        onChange={e => {
                            const newSettings = { ...settings }
                            newSettings.simulatedAnnealing.temperatureDecreaseRate.value = parseFloat(e.target.value)
                            setSettings(newSettings)
                        }}
                    />
                </Col>
                <Col xs={12} md={6}>
                    <Form.Label className="fs-3">
                        Top Candidates Ratio: <strong>{settings.simulatedAnnealing.topCandidatesRatio.value}</strong>
                    </Form.Label>
                    <Form.Range
                        min={settings.simulatedAnnealing.topCandidatesRatio.min}
                        max={settings.simulatedAnnealing.topCandidatesRatio.max}
                        step={settings.simulatedAnnealing.topCandidatesRatio.step}
                        value={settings.simulatedAnnealing.topCandidatesRatio.value}
                        onChange={e => {
                            const newSettings = { ...settings }
                            newSettings.simulatedAnnealing.topCandidatesRatio.value = parseFloat(e.target.value)
                            setSettings(newSettings)
                        }}
                    />
                </Col>
                <Col xs={12} md={6}>
                    <Form.Label className="fs-3">
                        Straight Successes to Cooldown:{' '}
                        <strong>{settings.simulatedAnnealing.consecutiveSuccessesToCooldown.value}</strong>
                    </Form.Label>
                    <Form.Range
                        min={settings.simulatedAnnealing.consecutiveSuccessesToCooldown.min}
                        max={settings.simulatedAnnealing.consecutiveSuccessesToCooldown.max}
                        step={settings.simulatedAnnealing.consecutiveSuccessesToCooldown.step}
                        value={settings.simulatedAnnealing.consecutiveSuccessesToCooldown.value}
                        onChange={e => {
                            const newSettings = { ...settings }
                            newSettings.simulatedAnnealing.consecutiveSuccessesToCooldown.value = parseFloat(
                                e.target.value
                            )
                            setSettings(newSettings)
                        }}
                    />
                </Col>
                <Col xs={12} md={6}>
                    <Form.Label className="fs-3">
                        Weight Disturbance Ratio:{' '}
                        <strong>{settings.simulatedAnnealing.weightDisturbanceRatio.value}</strong>
                    </Form.Label>
                    <Form.Range
                        min={settings.simulatedAnnealing.weightDisturbanceRatio.min}
                        max={settings.simulatedAnnealing.weightDisturbanceRatio.max}
                        step={settings.simulatedAnnealing.weightDisturbanceRatio.step}
                        value={settings.simulatedAnnealing.weightDisturbanceRatio.value}
                        onChange={e => {
                            const newSettings = { ...settings }
                            newSettings.simulatedAnnealing.weightDisturbanceRatio.value = parseFloat(e.target.value)
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
