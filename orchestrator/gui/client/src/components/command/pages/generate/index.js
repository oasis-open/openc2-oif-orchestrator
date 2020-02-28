import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { toast } from 'react-toastify';
import JSONPretty from 'react-json-pretty';

import {
  Button,
  ButtonGroup,
  Form,
  FormGroup,
  FormText,
  Input,
  Nav,
  NavItem,
  NavLink,
  TabContent,
  TabPane
} from 'reactstrap';

import JSONInput from 'react-json-editor-ajrm';
import locale from 'react-json-editor-ajrm/locale/en';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLongArrowAltRight } from '@fortawesome/free-solid-svg-icons';

import {
  zip,
  JADN_FIELD,
  JSON_FIELD,
  JADN_KEYS
} from './lib';

import {
  delMultiKey,
  generateUUID4,
  safeGet,
  setMultiKey
} from '../../../utils';

import JADNInput from '../../../utils/jadn-editor';
import * as GenerateActions from '../../../../actions/generate';
import * as CommandActions from '../../../../actions/command';

const Ajv = require('ajv');


class GenerateCommands extends Component {
  constructor(props, context) {
    super(props, context);

    this.optChange = this.optChange.bind(this);
    this.selectChange = this.selectChange.bind(this);
    this.clearCommand = this.clearCommand.bind(this);
    this.sendCommand = this.sendCommand.bind(this);
    this.updateChannel = this.updateChannel.bind(this);

    this.jadn_keys = ['meta', 'types'];
    this.json_validator = new Ajv({
      unknownFormats: 'ignore'
    });
    this.msg_form = React.createRef();

    this.theme = {
      schema: { // Theming for JADN/JSON input
        default: '#D4D4D4',
        background: '#FCFDFD',
        background_warning: '#FEECEB',
        string: '#FA7921',
        number: '#70CE35',
        colon: '#49B8F7',
        keys: '#59A5D8',
        keys_whiteSpace: '#835FB6',
        primitive: '#386FA4'
      },
      message: { // Theming for JSONPretty
        main: 'color:#D4D4D4;background:#FCFDFD;overflow:auto;',
        error: 'color:#f92672;background:#FEECEB;overflow:auto;',
        key: 'color:#59A5D8;',
        string: 'color:#FA7921;',
        value: 'color:#386FA4;',
        boolean: 'color:#386FA4;'
      }
    };

    this.state = {
      active_tab: 'creator',
      msg_record: '',
      channel: {
        serialization: '',
        protocol: ''
      },
      schema: {
        schema: {},
        selected: 'empty',
        type: '',
        jadn_fmt: false,
        exports: []
      },
      message: {},
      message_warnings: []
    };

    this.props.actuatorInfo();
    this.props.deviceInfo();
  }

  shouldComponentUpdate(nextProps, nextState) {
    const propsUpdate = this.props !== nextProps;
    const stateUpdate = this.state !== nextState;

    if (this.state.schema.schema !== nextState.schema.schema) {
      this.props.setSchema(nextState.schema.schema);
      // eslint-disable-next-line no-param-reassign
      nextState.message = {};
      // eslint-disable-next-line no-param-reassign
      nextState.channel = {
        serialization: '',
        protocol: ''
      };
    } else if (this.state.schema.schema !== nextProps.selected.schema) {
      // eslint-disable-next-line no-param-reassign
      nextState.schema = {
        ... nextState.schema,
        schema: nextProps.selected.schema,
        profile: nextProps.selected.profile
      };
      this.props.setSchema(nextState.schema.schema);
      // eslint-disable-next-line no-param-reassign
      nextState.message = {};
      // eslint-disable-next-line no-param-reassign
      nextState.channel = {
        serialization: '',
        protocol: ''
      };
    }

    const schemaKeys = Object.keys(nextState.schema.schema);
    // eslint-disable-next-line no-param-reassign
    nextState.schema.jadn_fmt = schemaKeys.length === this.jadn_keys.length
      && schemaKeys.every(v => this.jadn_keys.indexOf(v) !== -1);

    if (nextState.schema.jadn_fmt) {
      // eslint-disable-next-line no-param-reassign
      nextState.schema.exports = safeGet(safeGet(nextState.schema.schema, 'meta', {}), 'exports', []);
    } else if (!nextState.schema.jadn_fmt && 'properties' in nextState.schema.schema) {
      // eslint-disable-next-line no-param-reassign
      nextState.schema.exports = Object.keys(nextState.schema.schema.properties).map(k => {
        const def = safeGet(nextState.schema.schema.properties, k, {});
        return '$ref' in def ? def.$ref.replace(/^#\/definitions\//, '') : '';
      });
    } else if (!nextState.schema.jadn_fmt) {
      // eslint-disable-next-line no-param-reassign
      nextState.schema.exports = safeGet(nextState.schema.schema, 'oneOf', [])
        .map(exp => '$ref' in exp ? exp.$ref.replace(/^#\/definitions\//, '') : '');
    }
    // eslint-disable-next-line no-param-reassign
    nextState.schema.exports = nextState.schema.exports.filter(s => s);
    return propsUpdate || stateUpdate;
  }

  makeID() {
    this.setState(prevState => ({
      message: {
        ...prevState.message,
        command_id: generateUUID4()
      }
    }));
  }

  toggleTab(tab) {
    this.setState({
      active_tab: tab
    });
  }

  updateChannel(e) {
    const target = e.currentTarget;
    this.setState(prevState => ({
      channel: {
        ...prevState.channel,
        [target.id]: target.value
      }
    }));
  }

  sendCommand() {
    if (this.state.schema.type === 'actuator') {
      if (this.state.channel.protocol === '') {
        toast(<div><p>Error:</p><p>Actuator protocol not set</p></div>, {type: toast.TYPE.WARNING});
        return;
      }
      if (this.state.channel.serialization === '') {
        toast(<div><p>Error:</p><p>Actuator serialization not set</p></div>, {type: toast.TYPE.WARNING});
        return;
      }
    }

    const actuator = `${this.state.schema.type}/${this.state.schema.selected}`;
    toast.info('Request sent');
    // this.props.sendCommand(this.state.message, actuator, this.state.channel);

    Promise.resolve(this.props.sendCommand(this.state.message, actuator, this.state.channel)).then(() => {
      const errs = safeGet(this.props.errors, CommandActions.SEND_COMMAND_FAILURE, {});

      if (Object.keys(errs).length !== 0) {
        if ('non_field_errors' in errs) {
          Object.values(errs).forEach((err) => {
            toast(<p>Error: { err }</p>, {type: toast.TYPE.WARNING});
          });
        } else {
          Object.keys(errs).forEach((err) => {
            toast(<div><p>Error { err }:</p><p>{ errs[err] }</p></div>, {type: toast.TYPE.WARNING});
          });
        }
      } else {
        // TODO: Process responses ??
      }
    });
  }

  clearCommand() {
    this.msg_form.current.reset();
    this.setState({
      message: {}
    });
  }

  optChange(k, v) {
    this.setState(prevState => {
      const msg = prevState.message || {};
      let keys = k.split('.');
      let errors = [];
      keys = prevState.schema.exports.indexOf(keys[0]) === -1 ? keys : keys.slice(1);

      if (keys.length > 1 && msg[keys[0]] && !msg[keys[0]][keys[1]]) {
        delMultiKey(msg, keys[0]);
      }
      if (['', ' ', null, undefined, [], {}].indexOf(v) === -1) {
        setMultiKey(msg, k, v);
      } else {
        delMultiKey(msg, k);
      }
      // TODO: Validate message - errors to state.message_warnings as array
      if (prevState.schema.jadn_fmt) {
        console.log('Generated from JADN', msg);

      } else {
        // console.log('Generated from JSON', prevState.msg_record, msg)
        let tmpMsg = msg;
        if ('properties' in prevState.schema.schema) {
          const idx = prevState.schema.exports.indexOf(prevState.msg_record);
          const msgWrapper = Object.keys(prevState.schema.schema.properties)[idx];
          tmpMsg = {
            [msgWrapper]: msg
          };
        }
        try {
          const valid = this.json_validator.validate(prevState.schema.schema, tmpMsg);
          if (!valid) {
            errors = this.json_validator.errors;
          }
        } catch (err) {
          console.log(err);
          errors = [ JSON.stringify(err) ];
        }
      }

      return {
        message: msg,
        message_warnings: errors
      };
    });
  }

  selectChange(e) {
    const selected = e.target.value;
    const idx = e.nativeEvent.target.selectedIndex;
    const field = e.nativeEvent.target[idx].getAttribute('field');
    let schemaAct = '';

    if (field === 'profile') {
      let actProfile = this.props.actuators.filter((act) => act.profile === selected);

      if (actProfile.length === 0) {
        toast(<p>Something happened, invalid profile</p>, {type: toast.TYPE.WARNING});
        return;
      }
      actProfile = actProfile[Math.floor(Math.random()*actProfile.length)];
      schemaAct = actProfile.actuator_id;

    } else if (field === 'actuator') {
      let actName = this.props.actuators.filter((act) => act.actuator_id === selected);

      if (actName.length === 0 || actName.length > 1) {
        toast(<p>Something happened, invalid actuator</p>, {type: toast.TYPE.WARNING});
        return;
      }
      actName = actName[0];
      schemaAct = actName.actuator_id;
    }

    this.setState(prevState => ({
      msg_record: '',
      message: {},
      schema: {
        ...prevState.schema,
        selected,
        type: field
      }
    }), () => {
      this.props.actuatorSelect(schemaAct, field);
    });
  }

  schema(maxHeight) {
    const Editor = this.state.schema.jadn_fmt ? JADNInput : JSONInput;
    const actuatorSchemas = [];
    let profileSchemas = [];

    this.props.actuators.forEach(act => {
      let dev = this.props.devices.filter(d => d.device_id === act.device);
      dev = dev.length === 1 ? dev[0] : {};
      actuatorSchemas.push(<option key={ act.actuator_id } value={ act.actuator_id } field='actuator' >{ dev ? `${dev.name} - ` : '' }{ act.name }</option>);
      if (profileSchemas.indexOf(act.profile) === -1) {
        profileSchemas.push(act.profile);
      }
    });

    profileSchemas = profileSchemas.map(p => <option key={ p } value={ p } field='profile' >{ p }</option>);

    return (
      <div className="col-md-6">
        <div id="schema-card" className="tab-pane fade active show">
          <div className="card">
            <div className="card-header">
              <div className="row float-left col-sm-10 pl-0">
                <div className="form-group col-md-6 pr-0 pl-1">
                  <select id="schema-list" name="schema-list" className="form-control" default="empty" onChange={ this.selectChange }>
                    <option value="empty">Schema</option>
                    <optgroup label="Profiles">
                      { profileSchemas }
                    </optgroup>
                    <optgroup label="Actuators">
                      { actuatorSchemas }
                    </optgroup>
                  </select>
                </div>
              </div>
            </div>

            <div className="form-control border card-body p-0" style={{ height: `${maxHeight}px` }}>
              <Editor
                id='schema'
                placeholder={ this.state.schema.schema }
                colors={ this.theme.schema }
                locale={ locale }
                reset={ false }
                height='100%'
                width='100%'
                viewOnly
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  cmdCreator(maxHeight) {
    const exportRecords = this.state.schema.exports.map(rec => <option key={ rec } value={ rec }>{ rec }</option>);
    let RecordDef = '';
    let actProtos = [];
    let actSerials = [];
    let warnings = <p>Warnings for the generated message will appear here if available</p>;

    if (this.props.selected.schema) {
      let recordDef = {};
      if (this.state.schema.jadn_fmt) {
        recordDef = 'types' in this.props.selected.schema ? this.props.selected.schema.types.filter(type => type[0] === this.state.msg_record) : [];
        recordDef = zip(JADN_KEYS.Structure, recordDef.length === 1 ? recordDef[0] : []);
        RecordDef = <JADN_FIELD def={ recordDef } optChange={ this.optChange } />;
      } else if (this.props.selected.schema.definitions && this.state.msg_record in this.props.selected.schema.definitions) {
        recordDef = this.props.selected.schema.definitions[this.state.msg_record];
        RecordDef = <JSON_FIELD name={ this.state.msg_record } def={ recordDef } root optChange={ this.optChange } />;
      }
    }

    if (this.state.schema.type === 'actuator') {
      let act = this.props.actuators.filter(a => a.actuator_id === this.state.schema.selected);
      act = act.length === 1 ? act[0] : {};
      let dev = this.props.devices.filter(d => d.device_id === act.device);
      dev = dev.length === 1 ? dev[0] : {};

      actProtos = dev.transport.map(trans => {
        if (trans.protocol === this.state.channel.protocol) {
          actSerials = trans.serialization.map(serial => <option key={ serial } value={ serial }>{ serial }</option>);

          if (trans.serialization.indexOf(this.state.channel.serialization) === -1 && this.state.channel.serialization !== '') {
            this.setState(prevState => ({
              channel: {
                ...prevState.channel,
                serialization: ''
              }
            }));
          }
        }
        return (<option key={ trans.transport_id } value={ trans.protocol }>{ trans.protocol }</option>);
      });
    }

    if (this.state.message_warnings.length !== 0) {
      warnings = this.state.message_warnings.map((err, i) => (
        <div key={ i } className="border border-warning mb-2 px-2 pt-2">
          <p>Warning from message `{ err.dataPath || '.' }`
            <FontAwesomeIcon
              icon={ faLongArrowAltRight }
              className="mx-2"
            />
            &quot;{ err.keyword }&quot;
          </p>
          <p className="text-warning">{ err.message }</p>
        </div>
      ));
     }

    return (
      <div className='col-md-6'>
        <Nav tabs>
          <NavItem>
            <NavLink className={ this.state.active_tab === 'creator' ? 'active' : '' } onClick={() => this.toggleTab('creator') }>Creator</NavLink>
          </NavItem>
          <NavItem>
            <NavLink className={ this.state.active_tab === 'message' ? 'active' : '' } onClick={() => this.toggleTab('message') }>Message</NavLink>
          </NavItem>
          <NavItem>
            <NavLink className={ this.state.active_tab === 'warning' ? 'active' : ''} onClick={() => this.toggleTab('warning') }>Warnings <span className={ `badge badge-${this.state.message_warnings.length > 0 ? 'warning' : 'success'}` }>{ this.state.message_warnings.length }</span></NavLink>
          </NavItem>
        </Nav>

        <TabContent activeTab={ this.state.active_tab }>
          <TabPane tabId='creator'>
            <div className='card col-12 p-0 mx-auto'>
              <div className='card-header'>
                <FormGroup className='col-md-6 p-0 m-0 float-left'>
                  <Input type='select' className='form-control' value={ this.state.msg_record } onChange={e => { this.setState({'msg_record': e.target.value, message: {}}); }}>
                    <option value=''>Message Type</option>
                    <optgroup label="Exports">
                      { exportRecords }
                    </optgroup>
                  </Input>
                </FormGroup>
                <Button color='primary' className='float-right' onClick={ () => this.makeID() }>Generate ID</Button>
              </div>

              <Form id='command-fields' className='card-body' onSubmit={ () => false } innerRef={ this.msg_form } style={{ height: `${maxHeight-30}px`, overflowY: 'scroll' }}>
                <div id="fieldDefs">
                  { this.state.msg_record === '' ? <FormText color="muted">Message Fields will appear here after selecting a type</FormText> : RecordDef }
                </div>
              </Form>
            </div>
          </TabPane>

          <TabPane tabId='message'>
            <div className='card col-12 p-0 mx-auto'>
              <div className='card-header'>
                <ButtonGroup className='float-right col-2' vertical>
                  <Button color='danger' onClick={ this.clearCommand } style={{ padding: '.1rem 0' }}>Clear</Button>
                  <Button color='primary' onClick={ this.sendCommand } style={{ padding: '.1rem 0' }}>Send</Button>
                </ButtonGroup>
                <div className={ `col-10 p-0 ${this.state.schema.type === 'actuator' ? '' : ' d-none'}` }>
                  <FormGroup className='col-md-6 p-0 m-0 float-left'>
                    <Input id="protocol" type='select' className='form-control' value={ this.state.channel.protocol } onChange={ this.updateChannel }>
                      <option value=''>Protocol</option>
                      { actProtos }
                    </Input>
                  </FormGroup>
                  <FormGroup className='col-md-6 p-0 m-0 float-left'>
                    <Input id='serialization' type='select' className='form-control' value={ this.state.channel.serialization } onChange={ this.updateChannel }>
                      <option value=''>Serialization</option>
                      { actSerials }
                    </Input>
                  </FormGroup>
                </div>
              </div>

              <div className='card-body p-1 position-relative' style={{ height: `${maxHeight-25}px`, overflowY: 'scroll' }}>
                <JSONPretty
                  id='message'
                  className='scroll-xl'
                  style={{ minHeight: '2.5em' }}
                  data={ this.state.message }
                  theme={ this.theme.message }
                />
              </div>
            </div>
          </TabPane>

          <TabPane tabId='warning'>
            <div className='card col-12 p-0 mx-auto'>
              <div className='card-header h3'>
                Message Warnings
              </div>
              <div className='card-body p-2 position-relative' style={{ height: `${maxHeight-25}px`, overflowY: 'scroll' }}>
                { warnings }
              </div>
            </div>
          </TabPane>
        </TabContent>
      </div>
    );
  }

  render() {
    const maxHeight = window.innerHeight - (parseInt(document.body.style.paddingTop, 10) || 0) - 260;

    return (
      <div className='row mt-3'>
        { this.schema(maxHeight) }
        <div className='col-12 m-2 d-md-none' />
        { this.cmdCreator(maxHeight) }
        <div id='cmd-status' className='modal'>
          <div className='modal-dialog h-100 d-flex flex-column justify-content-center my-0' role='document'>
            <div className='modal-content'>
              <div className='modal-header'>
                <h5 className='modal-title'>Command: <span/></h5>
                <button type='button' className='close' data-dismiss='modal' aria-label='Close'>
                  <span aria-hidden='true'>&times;</span>
                </button>
              </div>

              <div className='modal-body'>
                <p className='cmd-details'><b>Details:</b> <span/></p>
                <p className='mb-1'><b>Command:</b></p>
                <pre className='border code command' />
                <p className='mb-1'><b>Responses:</b></p>
                <div className='p-1 border border-primary responses' />
              </div>

              <div className='modal-footer'>
                <button type='button' className='btn btn-secondary' data-dismiss='modal'>Close</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

GenerateCommands.propTypes = {
  actuators: PropTypes.array.isRequired,
  actuatorInfo: PropTypes.func.isRequired,
  actuatorSelect: PropTypes.func.isRequired,
  devices: PropTypes.array.isRequired,
  deviceInfo: PropTypes.func.isRequired,
  errors: PropTypes.object.isRequired,
  selected: PropTypes.shape({
    profile: PropTypes.string,
    schema: PropTypes.object
  }).isRequired,
  sendCommand: PropTypes.func.isRequired,
  setSchema: PropTypes.func.isRequired
};

const mapStateToProps = state => ({
  actuators: state.Generate.actuators || [],
  devices: state.Generate.devices || [],
  selected: state.Generate.selected || {},
  errors: state.Command.errors
});

const mapDispatchToProps = dispatch => ({
  setSchema: schema => dispatch(GenerateActions.setSchema(schema)),
  actuatorInfo: () => dispatch(GenerateActions.actuatorInfo()),
  actuatorSelect: (act, t) => dispatch(GenerateActions.actuatorSelect(act, t)),
  deviceInfo: () => dispatch(GenerateActions.deviceInfo()),
  sendCommand: (cmd, act, chan) => dispatch(CommandActions.sendCommand(cmd, act, chan))
});

export default connect(mapStateToProps, mapDispatchToProps)(GenerateCommands);
