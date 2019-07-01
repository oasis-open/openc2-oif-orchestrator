import React, { Component } from 'react'
import { connect } from 'react-redux'
import { toast } from 'react-toastify'

import {
    Button,
    Modal,
    ModalBody,
    ModalFooter,
    ModalHeader
} from 'reactstrap'

import JSONInput from 'react-json-editor-ajrm'
import locale from 'react-json-editor-ajrm/locale/en'

import {
    FormatJADN,
    generateUUID4,
    validateUUID4
} from '../../utils'

import * as ActuatorActions from '../../../actions/actuator'
import * as DeviceActions from '../../../actions/device'
import { withGUIAuth } from '../../../actions/util'

class UserModal extends Component {
    constructor(props, context) {
        super(props, context)

        this.toggleModal = this.toggleModal.bind(this)
        this.genUUID = this.genUUID.bind(this)
        this.changeParent = this.changeParent.bind(this)
        this.registerActuator = this.registerActuator.bind(this)
        this.saveActuator = this.saveActuator.bind(this)
        this.loadSchema = this.loadSchema.bind(this)
        this.textareaChange = this.textareaChange.bind(this)

        this.register = this.props.register == true
        this.schemaUpload = null
        this.defaultParent = {}

        this.defaultActuator = {
            name: 'Actuator',
            actuator_id: 'UUID',
            device: this.defaultParent.name || 'Parent UUID',
            schema: {}
        }

        this.state = {
            modal: false,
            actuator: {
                ...this.defaultActuator
            }
        }
    }

    componentDidMount() {
        if (this.register) {
            if (this.props.devices.length == 0) {
                this.props.getDevices()
                this.defaultParent = {}
            } else {
                this.defaultParent = this.props.devices[0]
            }
        } else if (this.props.data) {
            if (this.props.devices.length >= 1) {
                let tmpParent = this.props.devices.filter(d => d.name === this.props.data.device)
                this.defaultParent = tmpParent.length === 1 ? tmpParent[0] : {}
            } else {
                this.props.getDevice(this.props.data.device)
            }
        }
        this.defaultActuator.device = this.defaultParent.name || 'Parent UUID'
    }

    shouldComponentUpdate(nextProps, nextState) {
        let props_update = this.props != nextProps
        let state_update = this.state != nextState

        if (nextProps.devices.length >= 1 && !validateUUID4(nextState.actuator.device)) {
            let tmpParent = this.props.devices.filter(d => d.name === this.state.actuator.device)
            this.defaultParent = tmpParent.length === 1 ? tmpParent[0] : this.props.devices[0] || {}

            this.defaultActuator = {
                name: 'Actuator',
                actuator_id: 'UUID',
                device: this.defaultParent.device_id || 'Parent UUID',
                schema: {}
            }
            nextState.actuator.device = this.defaultActuator.device
        }
        return props_update || state_update
    }

    genUUID() {
        this.setState(prevState => ({
            actuator: {
                ...prevState.actuator,
                actuator_id: generateUUID4()
            }
        }))
    }

    toggleModal() {
        this.setState(prevState => ({
            modal: !prevState.modal,
            actuator: {
                ...this.defaultActuator,
                ...(this.register ? {} : this.props.data)
            }
        }))
    }

    changeParent(e) {
        let parent = this.props.devices.filter(dev => dev.device_id === e.target.value)
        parent = parent.length === 1 ? parent[0] : {}

        this.setState(prevState => ({
            actuator: {
                ...prevState.actuator,
                device: parent.device_id,
            }
        }))
    }

    registerActuator() {
        if (validateUUID4(this.state.actuator.actuator_id)) {
            Promise.resolve(this.props.createActuator(this.state.actuator)).then(() => {
                setTimeout(() => {
                    let errs = this.props.errors[ActuatorActions.CREATE_ACTUATOR_FAILURE] || {}
                    if (Object.keys(errs).length == 0) {
                        this.toggleModal()
                    } else {
                        if (errs.hasOwnProperty('non_field_errors')) {
                            Object.values(errs).forEach(err => {
                               toast(<p>Error: { err }</p>, {type: toast.TYPE.WARNING})
                            })
                        } else {
                            Object.keys(errs).forEach(err => {
                               toast(<div><p>Error { err }:</p><p>{ errs[err] }</p></div>, {type: toast.TYPE.WARNING})
                            })
                        }
                    }
                }, 500)
            })
        } else {
            toast(<div><p>Error Actuator ID:</p><p>The ID given is not a valid UUIDv4</p></div>, {type: toast.TYPE.WARNING})
        }
    }

    saveActuator() {
        Promise.resolve(this.props.updateActuator(this.state.actuator.actuator_id, this.state.actuator)).then(() => {
            setTimeout(() => {
                let errs = this.props.errors[ActuatorActions.UPDATE_ACTUATOR_FAILURE] || {}
                if (Object.keys(errs).length == 0) {
                    this.toggleModal()
                } else {
                    if (errs.hasOwnProperty('non_field_errors')) {
                        Object.values(errs).forEach(err => {
                           toast(<p>Error: { err }</p>, {type: toast.TYPE.WARNING})
                        })
                    } else {
                        Object.keys(errs).forEach(err => {
                           toast(<div><p>Error { err }:</p><p>{ errs[err] }</p></div>, {type: toast.TYPE.WARNING})
                        })
                    }
                }
            }, 500)
        })
    }

    loadSchema(e) {
	   let file = e.target.files[0]
	   let fileReader = new FileReader()

		fileReader.onload = e => {
			let data = atob(fileReader.result.split(',')[1])
			try {
		        this.setState(prevState => ({
                    actuator: {
                        ...prevState.actuator,
                        schema: JSON.parse(data)
                    }
                }))
            } catch(e) {
                toast(<p>Schema cannot be loaded</p>, {type: toast.TYPE.WARNING})
                return
            }
    	}

    	fileReader.readAsDataURL(file)
	}

	textareaChange(e) {
	    e.preventDefault()
        try {
            this.setState(prevState => ({
                actuator: {
                    ...prevState.actuator,
                    schema: JSON.parse(e.target.value)
                }
            }))
        } catch (e) {
            toast(<p>Schema is not valid</p>, {type: toast.TYPE.WARNING})
        }
	}

    render() {
        let devices = this.props.devices.map((d, i) => <option key={ i } value={ d.device_id }>{ d.name }</option> )

        return (
            <div className={ 'd-inline-block ' + this.props.className }>
                <Button color='primary' size='sm' onClick={ this.toggleModal } >{ this.register ? 'Register' : 'Edit' }</Button>

                <Modal isOpen={ this.state.modal } toggle={ this.toggleModal } size='lg' >
                    <ModalHeader toggle={ this.toggleModal }>{ this.register ? 'Register' : 'Edit' }  Actuator</ModalHeader>
                    <ModalBody>
                        <form onSubmit={ () => false }>
                            <div className="form-row">
                                <div className="form-group col-lg-6">
                                    <label htmlFor="name">Name</label>
                                    <input type="text" className="form-control" id='name' value={ this.state.actuator.name } onChange={ (e) => this.setState({ actuator: {...this.state.actuator, name: e.target.value }}) } />
                                </div>

                                <div className="form-group col-lg-6">
                                    <label htmlFor="actuator_id">Actuator ID</label>
                                    <div className="input-group">
                                        <input type="text" className="form-control" id="actuator_id"  readOnly={ !this.register }value={ this.state.actuator.actuator_id } onChange={ (e) => this.setState({ actuator: {...this.state.actuator, actuator_id: e.target.value }}) }/>
                                        <div className="input-group-append">
                                            <Button color="info" disabled={ !this.register } onClick={ this.genUUID } >Gen ID</Button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group col-lg-6">
                                    <label htmlFor="parent_dev">Parent Device</label>
                                    <select className="form-control" id='parent_dev' default={ this.defaultParent.device_id } value={ this.state.actuator.device } onChange={ this.changeParent }>
                                        { devices }
                                    </select>
                                </div>
                            </div>

                            <div className="form-control border card-body p-0" style={{ height: '250px' }}>
                                <textarea
                                    style ={{
                                        height: '100%',
                                        width: '100%',
                                        border: 'none',
                                        overflow: 'auto',
                                        outline: 'none',
                                        boxShadow: 'none',
                                        resize: 'none'
                                    }}
                                    value={ FormatJADN(this.state.actuator.schema) }
                                    onChange={ this.textAreaChange }
                                />
                            </div>
                            <div className='clearfix' >
                                    <Button color='info' size='sm' className='float-right' onClick={ () => this.schemaUpload.click() }>Upload Schema</Button>
                                    <input
                                        type='file'
                                        className='d-none'
                                        ref={ e => this.schemaUpload = e }
                                        accept="application/json, .jadn, .json"
                                        onChange={ this.loadSchema }
                                    />
                                </div>
                        </form>
                    </ModalBody>
                    <ModalFooter>
                        <Button color="primary" onClick={ this.register ? this.registerActuator : this.saveActuator }>{ this.register ? 'Register' : 'Save' }</Button>
                        <Button color="danger" onClick={ this.toggleModal }>Cancel</Button>
                    </ModalFooter>
                </Modal>
            </div>
        )
    }
}

const mapStateToProps = (state) => ({
    orchestrator: {
        // ...state.Orcs.selected,
        protocols: state.Util.protocols,
        serializations: state.Util.serializations,
    },
    errors: state.Actuator.errors,
    admin: state.Auth.access.admin,
    devices: state.Device.devices
})


const mapDispatchToProps = (dispatch) => ({
    createActuator: (act) => dispatch(ActuatorActions.createActuator(act)),
    updateActuator: (actUUID, act) => dispatch(ActuatorActions.updateActuator(actUUID, act)),
    getDevice: (devUUID) => dispatch(DeviceActions.getDevice(devUUID)),
    getDevices: () => dispatch(DeviceActions.getDevices())
})

export default connect(mapStateToProps, mapDispatchToProps)(UserModal)
