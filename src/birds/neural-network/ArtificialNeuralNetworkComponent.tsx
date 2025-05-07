import { faCopy, faTrashCan } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useEffect, useState } from 'react';
import Button from 'react-bootstrap/Button';
import Col from 'react-bootstrap/Col';
import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';
import { NeuralNetworkSettings } from './NeuralNetworkSettings';


export const ArtificialNeuralNetworkComponent = (props: { value: NeuralNetworkSettings; onChange: (data: NeuralNetworkSettings) => void; }) => {
    const [settings, setSettings] = useState<NeuralNetworkSettings>(props.value);

    useEffect(() => {
        props.onChange(settings);
    }, [settings]);
    return <>
        <Row className='gx-4 justify-content-between align-items-center form-row px-4'>
            <Col xs={12}>
                <div className='fs-2 text-center mb-2'>Neural Network</div>
            </Col>
            {settings.hiddenLayers.map((layer, index) => {
                return <Row key={index} className='gx-2 justify-content-between align-items-center'>
                    <Col xs={12}>
                        <Form.Label column className='fs-3'>
                            [{index + 1}] Hidden Layer Neurons: <strong>{layer.neurons.value}</strong>
                        </Form.Label>
                    </Col>
                    <Col xs={10}>
                        <Form.Range
                            min={layer.neurons.min}
                            max={layer.neurons.max}
                            step={layer.neurons.step}
                            value={layer.neurons.value}
                            onChange={(e) => {
                                const newSettings = JSON.parse(JSON.stringify(settings));
                                newSettings.hiddenLayers[index].neurons.value = parseFloat(e.target.value); // Update the value
                                setSettings(newSettings);
                            }}
                        />
                    </Col>
                    <Col xs={2}>
                        <Form.Check
                            className="fs-4"
                            type="switch"
                            checked={layer.bias}
                            label="Bias"
                            onChange={(e) => {
                                const newSettings = { ...settings };
                                newSettings.hiddenLayers[index].bias = e.target.checked;
                                setSettings(newSettings);
                            }}
                        />
                    </Col>
                    <Col xs={6} className='ms-auto text-end'>
                        <Button variant="outline-secondary"
                            size='sm'
                            className="fs-4 text-tertiary mx-2"
                            onPointerDown={() => {
                                const newSettings = { ...settings };
                                newSettings.hiddenLayers.push({ ...layer });
                                setSettings(newSettings);
                            }}>
                            <FontAwesomeIcon icon={faCopy} />
                        </Button>
                        <Button variant="outline-danger"
                            size='sm'
                            className="fs-4 text-tertiary mx-2"
                            onPointerDown={() => {
                                if (settings.hiddenLayers.length <= 1) {
                                    return;
                                }
                                const newSettings = { ...settings };
                                newSettings.hiddenLayers.splice(index, 1);
                                setSettings(newSettings);
                            }}                        >
                            <FontAwesomeIcon icon={faTrashCan} />
                        </Button>
                    </Col>
                    <Col xs={12} className='hidden-layer-separator' />
                </Row>
            })}

        </Row ></>
}