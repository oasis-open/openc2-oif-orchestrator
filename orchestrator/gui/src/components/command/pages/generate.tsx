import React, { Component } from 'react';
import { Dispatch } from 'redux';
import { ConnectedProps, connect } from 'react-redux';
import classNames from 'classnames';
import Promise from 'promise-polyfill';
import { ErrorObject } from 'ajv';
import { toast } from 'react-toastify';
import MessageGenerator, { GeneratorChanges, Schema } from 'react-json-generator';
import JSONPretty from 'react-json-pretty';
import {
  Button, ButtonGroup, Form, FormGroup, FormText, Input, Nav, NavItem, NavLink, TabContent, TabPane
} from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLongArrowAltRight } from '@fortawesome/free-solid-svg-icons';
import { Command, Generate } from '../../../actions';
import { RootState } from '../../../reducers';
import {
  generateUUID4, objectValues, safeGet, validateUUID4
} from '../../utils';

// Const Vars
const editorTheme = { // Theming for JSONPretty
  main: 'color:#D4D4D4;background:#FCFDFD;overflow:auto;',
  error: 'color:#f92672;background:#FEECEB;overflow:auto;',
  key: 'color:#59A5D8;',
  string: 'color:#FA7921;',
  value: 'color:#386FA4;',
  boolean: 'color:#386FA4;'
};

// Interfaces
// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface GenerateCommandsProps {}

type ValidTabs = 'creator' | 'message' | 'warning'
interface GenerateCommandsState {
  active_tab: ValidTabs;
  msg_record: string;
  channel: {
    serialization: string;
    protocol: string;
  };
  schema: {
    schema: Schema.JSONSchema;
    profile: string;
    selected: string;
    type: string;
    exports: Array<string>;
  };
  message: Record<string, any>;
  message_warnings: Array<ErrorObject>;
}

// Redux Connector
const mapStateToProps = (state: RootState) => ({
  actuators: state.Generate.actuators,
  devices: state.Generate.devices,
  selected: state.Generate.selected,
  errors: state.Command.errors
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
  setSchema: (schema: Schema.JSONSchema) => dispatch(Generate.setSchema(schema)),
  actuatorInfo: () => dispatch(Generate.actuatorInfo()),
  actuatorSelect: (actUUID: string, type: 'actuator' | 'profile') => dispatch(Generate.actuatorSelect(actUUID, type)),
  deviceInfo: () => dispatch(Generate.deviceInfo()),
  sendCommand: (cmd: Command.Command, act: string, chan: Command.Channel) => dispatch(Command.sendCommand(cmd, act, chan))
});

const connector = connect(mapStateToProps, mapDispatchToProps);
type ConnectorProps = ConnectedProps<typeof connector>;
type GenerateCommandsConnectedProps = GenerateCommandsProps & ConnectorProps;

// Component
class GenerateCommands extends Component<GenerateCommandsConnectedProps, GenerateCommandsState> {

  constructor(props: GenerateCommandsConnectedProps) {
    super(props);
    this.optChange = this.optChange.bind(this);
    this.selectChange = this.selectChange.bind(this);
    this.clearCommand = this.clearCommand.bind(this);
    this.sendCommand = this.sendCommand.bind(this);
    this.updateChannel = this.updateChannel.bind(this);

    this.state = {
      active_tab: 'creator',
      msg_record: '',
      channel: {
        serialization: '',
        protocol: ''
      },
      schema: {
        schema: {
          $schema: 'http://json-schema.org/draft-07/schema#',
          $id: '',
          title: '',
          type: 'object',
          oneOf: [],
          definitions: {}
        },
        profile: '',
        selected: '',
        type: '',
        exports: []
      },
      message: {},
      message_warnings: []
    };

    const { actuatorInfo, deviceInfo } = this.props;
    actuatorInfo();
    deviceInfo();
  }

  shouldComponentUpdate(nextProps: GenerateCommandsConnectedProps, nextState: GenerateCommandsState) {
    const { setSchema } = this.props;
    const { schema } = this.state;

    const propsUpdate = this.props !== nextProps;
    const stateUpdate = this.state !== nextState;

    if (schema.schema !== nextState.schema.schema) {
      setSchema(nextState.schema.schema);
      // eslint-disable-next-line no-param-reassign
      nextState.message = {};
      // eslint-disable-next-line no-param-reassign
      nextState.channel = {
        serialization: '',
        protocol: ''
      };
    } else if (schema.schema !== nextProps.selected.schema) {
      // eslint-disable-next-line no-param-reassign
      nextState.schema = {
        ... nextState.schema,
        schema: nextProps.selected.schema,
        profile: nextProps.selected.profile
      };
      setSchema(nextState.schema.schema);
      // eslint-disable-next-line no-param-reassign
      nextState.message = {};
      // eslint-disable-next-line no-param-reassign
      nextState.channel = {
        serialization: '',
        protocol: ''
      };
    }

    if ('properties' in nextState.schema.schema) {
      // eslint-disable-next-line no-param-reassign
      const props = nextState.schema.schema.properties;
      nextState.schema.exports = Object.keys(props).map(k => {
        const def = props[k];
        return '$ref' in def ? def.$ref.replace(/^#\/definitions\//, '') : '';
      });
    } else if ('oneOf' in nextState.schema.schema) {
      // eslint-disable-next-line no-param-reassign
      nextState.schema.exports = nextState.schema.schema.oneOf.map(exp => '$ref' in exp ? exp.$ref.replace(/^#\/definitions\//, '') : '');
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

  toggleTab(tab: ValidTabs) {
    this.setState({
      active_tab: tab
    });
  }

  updateChannel(e: React.ChangeEvent<HTMLInputElement>) {
    const target = e.currentTarget;
    this.setState(prevState => ({
      channel: {
        ...prevState.channel,
        [target.id]: target.value
      }
    }));
  }

  sendCommand() {
    const { errors, sendCommand } = this.props;
    const { channel, message, schema } = this.state;

    if ('command_id' in message) {
      if (!validateUUID4(message.command_id)) {
        toast(
          <div>
            <p>Error:</p>
            <p>Command ID is not a valid UUIDv4</p>
          </div>,
          { type: toast.TYPE.WARNING }
        );
        return;
      }
    }

    let actuator = `${schema.type}/`;
    if (schema.type === 'actuator') {
      actuator += `${schema.selected}`;
      if (channel.protocol === '') {
        toast(
          <div>
            <p>Error:</p>
            <p>Actuator protocol not set</p>
          </div>,
          { type: toast.TYPE.WARNING }
        );
        return;
      }
      if (channel.serialization === '') {
        toast(
          <div>
            <p>Error:</p>
            <p>Actuator serialization not set</p>
          </div>,
          { type: toast.TYPE.WARNING }
        );
        return;
      }
    } else {
      actuator += `${schema.profile}`;
    }

    toast(
      <div>
        <p>Request sent</p>
      </div>,
      { type: toast.TYPE.INFO }
    );
    // sendCommand(message, actuator, channel);

    // eslint-disable-next-line promise/always-return, promise/catch-or-return
    Promise.resolve(sendCommand(message as Command.Command, actuator, channel)).then(() => {
      const errs = safeGet(errors, Command.SEND_COMMAND_FAILURE, {});

      if (Object.keys(errs).length !== 0) {
        if ('non_field_errors' in errs) {
          objectValues(errs).forEach((err) => {
            toast(<p>{ `Error: ${err}` }</p>, {type: toast.TYPE.WARNING});
          });
        } else {
          Object.keys(errs).forEach((err) => {
            toast(
              <div>
                <p>{ `Error ${err}:` }</p>
                <p>{ errs[err] }</p>
              </div>,
              { type: toast.TYPE.WARNING }
            );
          });
        }
      } else {
        // TODO: Process responses ??
      }
      return 0;
    });
  }

  clearCommand() {
    this.setState({
      msg_record: '',
      message: {}
    });
  }

  optChange({ jsObject, isValid, errors }: GeneratorChanges) {
    this.setState({
      message: jsObject,
      message_warnings: isValid ? [] : errors
    });
  }

  selectChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const { actuators } = this.props;
    const { options, selectedIndex, value } = e.target;
    const field = options[selectedIndex].getAttribute('data-field') as 'actuator' | 'profile';
    let schemaAct = '';

    if (field === 'profile') {
      const actProfiles = actuators.filter((act) => act.profile === value);

      if (actProfiles.length === 0) {
        toast(<p>Something happened, invalid profile</p>, {type: toast.TYPE.WARNING});
        return;
      }
      schemaAct = actProfiles[Math.floor(Math.random()*actProfiles.length)].actuator_id;
    } else if (field === 'actuator') {
      const actNames = actuators.filter((act) => act.actuator_id === value);

      if (actNames.length === 0 || actNames.length > 1) {
        toast(<p>Something happened, invalid actuator</p>, {type: toast.TYPE.WARNING});
        return;
      }
      // eslint-disable-next-line prefer-destructuring
      schemaAct = actNames[0].actuator_id;
    }

    this.setState(prevState => ({
      msg_record: '',
      message: {},
      schema: {
        ...prevState.schema,
        value,
        selected: schemaAct,
        type: field
      }
    }), () => {
      const { actuatorSelect } = this.props;
      actuatorSelect(schemaAct, field);
    });
  }

  schema(maxHeight: number) {
    const { actuators, devices } = this.props;
    const { schema } = this.state;

    const actuatorSchemas: Array<JSX.Element> = [];
    const profileSchemas: Set<JSX.Element> = new Set();

    actuators.forEach(act => {
      const devs = devices.filter(d => d.device_id === act.device);
      const dev = devs.length === 1 ? devs[0] : undefined;
      actuatorSchemas.push(<option key={ act.actuator_id } value={ act.actuator_id } data-field='actuator' >{ `${dev ? `${dev.name} - ` : ''}${act.name}` }</option>);
      profileSchemas.add(<option key={ act.profile } value={ act.profile } data-field='profile' >{ act.profile }</option>);
    });

    return (
      <div className="col-md-6">
        <div id="schema-card" className="tab-pane fade active show">
          <div className="card">
            <div className="card-header">
              <div className="row float-left col-sm-10 pl-0">
                <div className="form-group col-md-6 pr-0 pl-1">
                  <select id="schema-list" name="schema-list" className="form-control" defaultValue="empty" onChange={ this.selectChange }>
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
              <div className='p-1 position-relative' style={{ height: `${maxHeight-25}px`, overflowY: 'scroll' }}>
                <JSONPretty
                  id='schema'
                  className='scroll-xl'
                  style={{ minHeight: '2.5em' }}
                  data={ schema.schema }
                  theme={ editorTheme }
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  cmdCreator(maxHeight: number) {
    const { actuators, devices, selected } = this.props;
    const {
      // eslint-disable-next-line @typescript-eslint/naming-convention
      active_tab, channel, message, message_warnings, msg_record, schema
    } = this.state;

    const exportRecords = schema.exports.map(rec => <option key={ rec } value={ rec }>{ rec }</option>);
    let RecordDef: null | JSX.Element = null;
    let actProtos: Array<JSX.Element> = [];
    let actSerials: Array<JSX.Element> = [];
    let warnings = [
      <p key='warn'>Warnings for the generated message will appear here if available</p>
    ];

    if (selected.schema && selected.schema.definitions && msg_record in selected.schema.definitions) {
      RecordDef = (
        <MessageGenerator
          name={ msg_record }
          schema={ selected.schema }
          validate
          onChange={ this.optChange }
        />
      );
    }

    if (schema.type === 'actuator') {
      const acts = actuators.filter(a => a.actuator_id === schema.selected);
      const act = acts.length === 1 ? acts[0] : undefined;
      const devs = devices.filter(d => d.device_id === act?.device);
      const dev = devs.length === 1 ? devs[0] : undefined;

      if (dev) {
        actProtos = dev.transport.map(trans => {
          if (trans.protocol === channel.protocol) {
            actSerials = trans.serialization.map(serial => <option key={ serial } value={ serial }>{ serial }</option>);

            if (trans.serialization.indexOf(channel.serialization) === -1 && channel.serialization !== '') {
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
        setTimeout(() => {
          const defTrans = dev.transport.length >= 1 ? dev.transport[0] : undefined;
          if (defTrans && channel.protocol === '') {
            this.setState(prevState => ({
              channel: {
                ...prevState.channel,
                protocol: defTrans.protocol,
                serialization: defTrans.serialization[0]
              }
            }));
          }
        }, 10);
      }
    }

    if (message_warnings.length !== 0) {
      warnings = message_warnings.map((err, i) => (
        // eslint-disable-next-line react/no-array-index-key
        <div key={ i } className="border border-warning mb-2 px-2 pt-2">
          <p>
            { `Warning from message ${err.dataPath || '.'}` }
            <FontAwesomeIcon icon={ faLongArrowAltRight } className="mx-2" />
            { `"${ err.keyword }"` }
          </p>
          <p className="text-warning">{ err.message }</p>
        </div>
      ));
     }

    return (
      <div className='col-md-6'>
        <Nav tabs>
          <NavItem>
            <NavLink className={ classNames({ 'active': active_tab === 'creator' }) } onClick={ () => this.toggleTab('creator') }>Creator</NavLink>
          </NavItem>
          <NavItem>
            <NavLink className={ classNames({ 'active': active_tab === 'message' }) } onClick={ () => this.toggleTab('message') }>Message</NavLink>
          </NavItem>
          <NavItem>
            <NavLink className={ classNames({ 'active': active_tab === 'warning' }) } onClick={ () => this.toggleTab('warning') }>
              Warnings&nbsp;
              <span className={ `badge badge-${message_warnings.length > 0 ? 'warning' : 'success'}` }>{ message_warnings.length }</span>
            </NavLink>
          </NavItem>
        </Nav>

        <TabContent activeTab={ active_tab }>
          <TabPane tabId='creator'>
            <div className='card col-12 p-0 mx-auto'>
              <div className='card-header'>
                <FormGroup className='col-md-6 p-0 m-0 float-left'>
                  <Input type='select' className='form-control' value={ msg_record } onChange={ e => { this.setState({'msg_record': e.target.value, message: {}}); } }>
                    <option value=''>Message Type</option>
                    <optgroup label="Exports">
                      { exportRecords }
                    </optgroup>
                  </Input>
                </FormGroup>
                <Button color='primary' className='float-right' onClick={ () => this.makeID() }>Generate ID</Button>
              </div>

              <Form id='command-fields' className='card-body' onSubmit={ () => false } style={{ height: `${maxHeight-30}px`, overflowY: 'scroll' }}>
                <div id="fieldDefs">
                  { msg_record ? RecordDef : <FormText color="muted">Message Fields will appear here after selecting a type</FormText> }
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
                <div className={ `col-10 p-0 ${schema.type === 'actuator' ? '' : ' d-none'}` }>
                  <FormGroup className='col-md-6 p-0 m-0 float-left'>
                    <Input id="protocol" type='select' className='form-control' value={ channel.protocol } onChange={ this.updateChannel }>
                      <option value=''>Protocol</option>
                      { actProtos }
                    </Input>
                  </FormGroup>
                  <FormGroup className='col-md-6 p-0 m-0 float-left'>
                    <Input id='serialization' type='select' className='form-control' value={ channel.serialization } onChange={ this.updateChannel }>
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
                  data={ message }
                  theme={ editorTheme }
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
                <h5 className='modal-title'>
                  Command:&nbsp;
                  <span />
                </h5>
              </div>

              <div className='modal-body'>
                <p className='cmd-details'>
                  <b>Details:</b>
                  <span />
                </p>
                <p className='mb-1'>
                  <b>Command:</b>
                </p>
                <pre className='border code command' />
                <p className='mb-1'>
                  <b>Responses:</b>
                </p>
                <div className='p-1 border border-primary responses' />

                <button type='button' className='close' data-dismiss='modal' aria-label='Close'>
                  <span aria-hidden='true'>&times;</span>
                </button>
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

export default connector(GenerateCommands);
