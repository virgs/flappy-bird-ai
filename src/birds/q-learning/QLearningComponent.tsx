import { useEffect, useState } from 'react'
import Col from 'react-bootstrap/Col'
import Form from 'react-bootstrap/Form'
import Row from 'react-bootstrap/Row'
import { QLearningSettings } from './QLearningSettings'
import { Range } from '../../settings/BirdSettings'

type QLearningComponentProps = {
    value: QLearningSettings
    onChange: (data: QLearningSettings) => void
}

export const RangeComponent = (props: { range: Range; title: string; onChange: (value: number) => void }) => {
    const clampValue = (value: number) => {
        const stepValue = Math.round((value - props.range.min) / props.range.step) * props.range.step + props.range.min
        return Math.max(props.range.min, Math.min(props.range.max, stepValue))
    }

    const allowNegative = props.range.min < 0
    const allowDecimal = props.range.step < 1
    const pattern = new RegExp(`^${allowNegative ? '-?' : ''}\\d+${allowDecimal ? '(\\.\\d+)?' : ''}$`)

    return (
        <>
            <Row>
                <Col xs className="text-start justify-content-between">
                    <Form.Label className="fs-3 w-100">{props.title}:</Form.Label>
                </Col>
                <Col xs={'auto'} className="text-end">
                    <Form.Control
                        min={props.range.min}
                        max={props.range.max}
                        step={props.range.step}
                        value={props.range.value}
                        pattern={pattern.source}
                        onInput={e => {
                            console.log('onInput', e)
                            const input = e.target as HTMLInputElement
                            if (!pattern.test(input.value)) {
                                input.setCustomValidity('Invalid value')
                                console.log('Invalid value', input.value)
                                input.value = clampValue(parseFloat(props.range.value.toString())).toString()
                            } else {
                                console.log('Valid value', input.value)
                                input.setCustomValidity('')
                            }
                        }}
                        onInvalid={e => {
                            console.log('onInvalid', e)
                            const input = e.target as HTMLInputElement
                            if (input.validity.patternMismatch) {
                                input.setCustomValidity('Invalid value')
                            }
                        }}
                        onBlur={e => {
                            console.log('onBlur', e)
                            const input = e.target as HTMLInputElement
                            if (input.validity.patternMismatch) {
                                input.setCustomValidity('Invalid value')
                                console.log('Invalid value', input.value)
                            } else {
                                console.log('Valid value', input.value)
                                input.setCustomValidity('')
                            }
                            input.value = clampValue(parseFloat(input.value)).toString()
                            props.onChange(clampValue(parseFloat(input.value)))
                        }}
                        onChange={e => props.onChange(clampValue(parseFloat(e.target.value)))}
                        placeholder={props.title}
                        type="number"
                        aria-describedby="passwordHelpBlock"
                    />
                </Col>
            </Row>
            <Form.Range
                min={props.range.min}
                max={props.range.max}
                step={props.range.step}
                value={props.range.value}
                onChange={e => props.onChange(clampValue(parseFloat(e.target.value)))}
            />
        </>
    )
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
                <strong>Reverse Q-Learning</strong> takes the usual Q-learning approach — wandering forward through the
                void hoping to stumble onto a reward — and politely walks it backwards. Starting from the goal, it
                traces the steps that could have led there, assigning credit retroactively like a boss who congratulates
                you after accidentally seeing your results. It’s ideal when you already know how success looks but have
                no idea how to get there. This strategy solves puzzles by learning from the end and working back. Read
                more about it{' '}
                <a href="https://en.wikipedia.org/wiki/Q-learning" target="_blank" rel="noreferrer">
                    here
                </a>
            </div>
            <Row className="gx-4 justify-content-between align-items-center form-row">
                <Col xs={12}>
                    <div className="fs-2 text-center mb-2">Q-Learning</div>
                </Col>
                <Col xs={12} md={6}>
                    <Form.Label className="fs-3">
                        Total Population: <strong>{settings.totalPopulation.value}</strong>
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
                        Learning Rate (ɑ): <strong>{settings.learningRate.value}</strong>
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
                        Discount Factor (𝛾): <strong>{settings.discountFactor.value}</strong>
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
                <Col xs={12} md={6}>
                    <Form.Label className="fs-3">
                        Exploration Rate (ε): <strong>{settings.explorationRate.value}</strong>
                    </Form.Label>
                    <Form.Range
                        min={settings.explorationRate.min}
                        max={settings.explorationRate.max}
                        step={settings.explorationRate.step}
                        value={settings.explorationRate.value}
                        onChange={e => {
                            const newSettings = { ...settings }
                            newSettings.explorationRate.value = parseFloat(e.target.value)
                            setSettings(newSettings)
                        }}
                    />
                </Col>
                <Col xs={12} md={6}>
                    <Form.Label className="fs-3">
                        Exploration Rate Decay: <strong>{settings.explorationRateDecay.value}</strong>
                    </Form.Label>
                    <Form.Range
                        min={settings.explorationRateDecay.min}
                        max={settings.explorationRateDecay.max}
                        step={settings.explorationRateDecay.step}
                        value={settings.explorationRateDecay.value}
                        onChange={e => {
                            const newSettings = { ...settings }
                            newSettings.explorationRateDecay.value = parseFloat(e.target.value)
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
                    <div className="fs-3 text-center mb-2">Velocity Discretization</div>
                </Col>
                <Col xs={12} md={6}>
                    <Form.Label className="fs-3">
                        Vertical Velocity: <strong>{settings.verticalVelocityDiscretization.value}</strong>
                    </Form.Label>
                    <Form.Range
                        min={settings.verticalVelocityDiscretization.min}
                        max={settings.verticalVelocityDiscretization.max}
                        step={settings.verticalVelocityDiscretization.step}
                        value={settings.verticalVelocityDiscretization.value}
                        onChange={e => {
                            const newSettings = { ...settings }
                            newSettings.verticalVelocityDiscretization.value = parseFloat(e.target.value)
                            setSettings(newSettings)
                        }}
                    />
                </Col>
                <Col xs={12}>
                    <div className="fs-3 text-center mb-2">Rewards</div>
                </Col>
                <Col xs={12} md={6}>
                    <Form.Label className="fs-3">
                        Milliseconds Alive: <strong>{settings.rewards.millisecondsAlive.value}</strong>
                    </Form.Label>
                    <Form.Range
                        min={settings.rewards.millisecondsAlive.min}
                        max={settings.rewards.millisecondsAlive.max}
                        step={settings.rewards.millisecondsAlive.step}
                        value={settings.rewards.millisecondsAlive.value}
                        onChange={e => {
                            const newSettings = { ...settings }
                            newSettings.rewards.millisecondsAlive.value = parseFloat(e.target.value)
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
                        Hit Top Pipe: <strong>{settings.rewards.hitTopPipe.value}</strong>
                    </Form.Label>
                    <Form.Range
                        min={settings.rewards.hitTopPipe.min}
                        max={settings.rewards.hitTopPipe.max}
                        step={settings.rewards.hitTopPipe.step}
                        value={settings.rewards.hitTopPipe.value}
                        onChange={e => {
                            const newSettings = { ...settings }
                            newSettings.rewards.hitTopPipe.value = parseFloat(e.target.value)
                            setSettings(newSettings)
                        }}
                    />
                </Col>
                <Col xs={12} md={6}>
                    <Form.Label className="fs-3">
                        Hit Bottom Pipe: <strong>{settings.rewards.hitBottomPipe.value}</strong>
                    </Form.Label>
                    <Form.Range
                        min={settings.rewards.hitBottomPipe.min}
                        max={settings.rewards.hitBottomPipe.max}
                        step={settings.rewards.hitBottomPipe.step}
                        value={settings.rewards.hitBottomPipe.value}
                        onChange={e => {
                            const newSettings = { ...settings }
                            newSettings.rewards.hitBottomPipe.value = parseFloat(e.target.value)
                            setSettings(newSettings)
                        }}
                    />
                </Col>
                <Col xs={12} md={6}>
                    <Form.Label className="fs-3">
                        Hit Ceiling: <strong>{settings.rewards.hitCeiling.value}</strong>
                    </Form.Label>
                    <Form.Range
                        min={settings.rewards.hitCeiling.min}
                        max={settings.rewards.hitCeiling.max}
                        step={settings.rewards.hitCeiling.step}
                        value={settings.rewards.hitCeiling.value}
                        onChange={e => {
                            const newSettings = { ...settings }
                            newSettings.rewards.hitCeiling.value = parseFloat(e.target.value)
                            setSettings(newSettings)
                        }}
                    />
                </Col>
                <Col xs={12} md={6}>
                    <Form.Label className="fs-3">
                        Hit Floor: <strong>{settings.rewards.hitFloor.value}</strong>
                    </Form.Label>
                    <Form.Range
                        min={settings.rewards.hitFloor.min}
                        max={settings.rewards.hitFloor.max}
                        step={settings.rewards.hitFloor.step}
                        value={settings.rewards.hitFloor.value}
                        onChange={e => {
                            const newSettings = { ...settings }
                            newSettings.rewards.hitFloor.value = parseFloat(e.target.value)
                            setSettings(newSettings)
                        }}
                    />
                </Col>
            </Row>
        </>
    )
}
