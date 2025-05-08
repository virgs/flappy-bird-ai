import { useEffect, useState } from 'react'
import Col from 'react-bootstrap/Col'
import Form from 'react-bootstrap/Form'
import Row from 'react-bootstrap/Row'
import { QLearningSettings } from './QLearningSettings'

type QLearningComponentProps = {
    value: QLearningSettings
    onChange: (data: QLearningSettings) => void
}

export const QLearningComponent = (props: QLearningComponentProps) => {
    const [settings, setSettings] = useState<QLearningSettings>(props.value)

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
                <strong>Q-Learning</strong> is a type of reinforcement learning algorithm that learns the value of
                actions in a given state. It uses a table to store the values of actions for each state, and updates
                these values based on the rewards received from the environment. The algorithm uses a discount factor to
                balance the importance of immediate and future rewards. Read more about it{' '}
                <a href="https://en.wikipedia.org/wiki/Q-learning" target="_blank" rel="noreferrer">
                    here
                </a>
                .
            </div>
            <Row className="gx-4 justify-content-between align-items-center form-row">
                <Col xs={12}>
                    <div className="fs-2 text-center mb-2">Q-Learning</div>
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
                        Learning Rate: <strong>{settings.learningRate.value}</strong>
                    </Form.Label>
                    <Form.Range
                        min={settings.learningRate.min}
                        max={settings.learningRate.max}
                        step={settings.learningRate.step}
                        value={settings.learningRate.value}
                        onChange={e => {
                            const newSettings = { ...settings }
                            newSettings.learningRate.value = parseFloat(e.target.value)
                            setSettings(newSettings)
                        }}
                    />
                </Col>
                <Col xs={12} md={6}>
                    <Form.Label className="fs-3">
                        Discount Factor: <strong>{settings.discountFactor.value}</strong>
                    </Form.Label>
                    <Form.Range
                        min={settings.discountFactor.min}
                        max={settings.discountFactor.max}
                        step={settings.discountFactor.step}
                        value={settings.discountFactor.value}
                        onChange={e => {
                            const newSettings = { ...settings }
                            newSettings.discountFactor.value = parseFloat(e.target.value)
                            setSettings(newSettings)
                        }}
                    />
                </Col>
                <Col xs={12}>
                    <div className="fs-3 text-center mb-2">Spacial Grid Discretization</div>
                </Col>
                <Col xs={12} md={6}>
                    <Form.Label className="fs-3">
                        Horizontal: <strong>{settings.gridSpatialAbstraction.horizontal.value}</strong>
                    </Form.Label>
                    <Form.Range
                        min={settings.gridSpatialAbstraction.horizontal.min}
                        max={settings.gridSpatialAbstraction.horizontal.max}
                        step={settings.gridSpatialAbstraction.horizontal.step}
                        value={settings.gridSpatialAbstraction.horizontal.value}
                        onChange={e => {
                            const newSettings = { ...settings }
                            newSettings.gridSpatialAbstraction.horizontal.value = parseFloat(e.target.value)
                            setSettings(newSettings)
                        }}
                    />
                </Col>
                <Col xs={12} md={6}>
                    <Form.Label className="fs-3">
                        Vertical: <strong>{settings.gridSpatialAbstraction.vertical.value}</strong>
                    </Form.Label>
                    <Form.Range
                        min={settings.gridSpatialAbstraction.vertical.min}
                        max={settings.gridSpatialAbstraction.vertical.max}
                        step={settings.gridSpatialAbstraction.vertical.step}
                        value={settings.gridSpatialAbstraction.vertical.value}
                        onChange={e => {
                            const newSettings = { ...settings }
                            newSettings.gridSpatialAbstraction.vertical.value = parseFloat(e.target.value)
                            setSettings(newSettings)
                        }}
                    />
                </Col>
                <Col xs={12}>
                    <div className="fs-3 text-center mb-2">Rewards</div>
                </Col>
                <Col xs={12} md={6}>
                    <Form.Label className="fs-3">
                        Stay Alive: <strong>{settings.rewards.stayAlive.value}</strong>
                    </Form.Label>
                    <Form.Range
                        min={settings.rewards.stayAlive.min}
                        max={settings.rewards.stayAlive.max}
                        step={settings.rewards.stayAlive.step}
                        value={settings.rewards.stayAlive.value}
                        onChange={e => {
                            const newSettings = { ...settings }
                            newSettings.rewards.stayAlive.value = parseFloat(e.target.value)
                            setSettings(newSettings)
                        }}
                    />
                </Col>
                <Col xs={12} md={6}>
                    <Form.Label className="fs-3">
                        Passed Pipe: <strong>{settings.rewards.passedPipe.value}</strong>
                    </Form.Label>
                    <Form.Range
                        min={settings.rewards.passedPipe.min}
                        max={settings.rewards.passedPipe.max}
                        step={settings.rewards.passedPipe.step}
                        value={settings.rewards.passedPipe.value}
                        onChange={e => {
                            const newSettings = { ...settings }
                            newSettings.rewards.passedPipe.value = parseFloat(e.target.value)
                            setSettings(newSettings)
                        }}
                    />
                </Col>
                <Col xs={12} md={6}>
                    <Form.Label className="fs-3">
                        Hit Pipes: <strong>{settings.rewards.hitObstacle.value}</strong>
                    </Form.Label>
                    <Form.Range
                        min={settings.rewards.hitObstacle.min}
                        max={settings.rewards.hitObstacle.max}
                        step={settings.rewards.hitObstacle.step}
                        value={settings.rewards.hitObstacle.value}
                        onChange={e => {
                            const newSettings = { ...settings }
                            newSettings.rewards.hitObstacle.value = parseFloat(e.target.value)
                            setSettings(newSettings)
                        }}
                    />
                </Col>
                <Col xs={12} md={6}>
                    <Form.Label className="fs-3">
                        Hit Floor or Ceiling: <strong>{settings.rewards.hitFloorOrCeiling.value}</strong>
                    </Form.Label>
                    <Form.Range
                        min={settings.rewards.hitFloorOrCeiling.min}
                        max={settings.rewards.hitFloorOrCeiling.max}
                        step={settings.rewards.hitFloorOrCeiling.step}
                        value={settings.rewards.hitFloorOrCeiling.value}
                        onChange={e => {
                            const newSettings = { ...settings }
                            newSettings.rewards.hitFloorOrCeiling.value = parseFloat(e.target.value)
                            setSettings(newSettings)
                        }}
                    />
                </Col>
            </Row>
        </>
    )
}
