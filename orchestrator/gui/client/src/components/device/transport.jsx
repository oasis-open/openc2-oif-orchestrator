import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Button, FormText, Input, Label } from 'reactstrap';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';

import { FileBase64 } from '../utils';

export const defaultTransport = {
  transport_id: '',
  host: '127.0.0.1',
  port: 8080,
  protocol: 'HTTPS',
  serialization: ['JSON'],
  username: '',
  password_1: '',
  password_2: '',
  ca_cert: '',
  client_cert: '',
  client_key: '',
  auth: {
    password: false,
    ca_cert: false,
    client_cert: false,
    client_key: false
  }
};

class Transport extends Component {
  constructor(props, context) {
    super(props, context);
    this.certChange = this.certChange.bind(this);
    this.checkboxChange = this.checkboxChange.bind(this);
    this.transportRemove = this.transportRemove.bind(this);
    this.transportChange = this.transportChange.bind(this);

    const { data } = this.props;

    this.state = {
      ...defaultTransport,
      ...data
    };
  }

  componentDidMount() {
    this.mounted = true;
  }

  shouldComponentUpdate(nextProps, nextState) {
    const propsUpdate = this.props !== nextProps;
    const stateUpdate = this.state !== nextState;

    if (propsUpdate && this.mounted) {
      setTimeout(() => {
        const { data } = this.props;
        this.setState(data);
      }, 10);
    }

    return propsUpdate || stateUpdate;
  }

  componentWillUnmount() {
    this.mounted = false;
  }

  checkboxChange(e) {
    const { checked, id, name } = e.target;
    const item = id.replace(/^checkbox_\d+_/, '');

    // eslint-disable-next-line react/destructuring-assignment, react/no-access-state-in-setstate
    const tmpVal = this.state[name];
    const idx = tmpVal.indexOf(item);

    if (checked) {
      if (idx === -1) tmpVal.push(item);
    } else if (idx >= 0 && tmpVal.length > 1) {
      tmpVal.splice(idx, 1);
    }

    this.setState({
      [name]: tmpVal
    }, () => {
      const { change, index } = this.props;
      change(this.state, index);
    });
  }

  transportRemove(e) {
    e.preventDefault();
    const { index, remove } = this.props;
    remove(index);
  }

  transportChange(e, reset=false) {
    const { name, value } = e.target;
    let tmpState = {};
    if (reset) {
      tmpState = e;
    } else {
      tmpState[name] = name.startsWith('password') ? btoa(value) : value;
    }

    this.setState(
      tmpState,
      () => {
        const { change, index } = this.props;
        change(this.state, index);
      }
    );
  }

  certChange(file) {
    const { base64, id } = file;
    this.setState({
      [id]: base64
    },
    () => {
      const { change, index } = this.props;
      change(this.state, index);
    });
  }

  render() {
    const { orchestrator } = this.props;
    const {
      auth, host, port, password_1, password_2, protocol, serialization, username
    } = this.state;

    const protocols = Object.keys(orchestrator.protocols).map(p => (
      <option key={ p } value={ p }>{ p }</option>
    ));

    const serializations = orchestrator.serializations.map((s, i) => (
      <div key={ s } className="form-check-inline">
        <Label className="form-check-Label">
          <Input
            id={ `checkbox_${i}_${s}` }
            className="form-check-input"
            type="checkbox"
            name="serialization"
            checked={ serialization.includes(s) }
            onChange={ this.checkboxChange }
          />
          { s }
        </Label>
      </div>
    ));

    return (
      <div className="border mb-2 p-2">
        <Button color="danger" size="sm" className="float-right" onClick={ this.transportRemove } >
          <FontAwesomeIcon icon={ faTimes } />
        </Button>

        <div className="form-row border-bottom">
          <h5 className="col-12">Connection</h5>
          <div className="form-group col-lg-4">
            <Label for="protocol">Protocol</Label>
            <select
              className="form-control"
              name="protocol"
              value={ protocol }
              onChange={ this.transportChange }
            >
              { protocols }
            </select>
          </div>

          <div className="form-group col-lg-4">
            <Label for="host">Host</Label>
            <Input
              id="host"
              className="form-control"
              type="text"
              name="host"
              value={ host }
              onChange={ this.transportChange }
            />
          </div>

          <div className="form-group col-lg-4">
            <Label for="port">Port</Label>
            <Input
              id="port"
              className="form-control"
              type="text"
              name="port"
              value={ port }
              onChange={ this.transportChange }
            />
          </div>
        </div>

        <div className="form-row border-bottom">
          <h5 className="col-12">Serializations</h5>
          <div className="form-group col-12">
            { serializations }
          </div>
        </div>

        <div className="form-row">
          <h5 className="col-12">Authentication</h5>
          <div className="form-group col-lg-4">
            <Label for="username">Username</Label>
            <Input
              id="username"
              className="form-control"
              type="text"
              name="username"
              value={ username }
              onChange={ this.transportChange }
            />

          </div>
          <div className="form-group col-lg-4">
            <Label for="password_1">Password</Label>
            <Input
              id="password_1"
              className="form-control"
              type="password"
              name="password_1"
              value={ atob(password_1) }
              onChange={ this.transportChange }
            />
            <FormText color={ auth.password ? 'success' : 'muted' }>Password is { auth.password ? '' : 'not ' } set</FormText>
          </div>
          <div className="form-group col-lg-4">
            <Label for="password_2">Password Confirmation</Label>
            <Input
              id="password_2"
              className="form-control"
              type="password"
              name="password_2"
              value={ atob(password_2) }
              onChange={ this.transportChange }
            />
          </div>

          <div className="form-group col-lg-4">
            <Label for="ca_cert">CA Certificate</Label>
            <FileBase64
              id="ca_cert"
              className="form-control"
              name="ca_cert"
              onDone={ this.certChange }
            />
            <FormText color={ auth.ca_cert ? 'success' : 'muted' }>CA Certificate is { auth.ca_cert ? '' : 'not ' } set</FormText>
          </div>

          <div className="form-group col-lg-4">
            <Label for="client_cert">Client Certificate</Label>
            <FileBase64
              id="client_cert"
              className="form-control"
              name="client_cert"
              onDone={ this.certChange }
            />
            <FormText color={ auth.client_cert ? 'success' : 'muted' }>Client Certificate is { auth.client_cert ? '' : 'not ' } set</FormText>
          </div>

          <div className="form-group col-lg-4">
            <Label for="client_key">Client Key</Label>
            <FileBase64
              id="client_key"
              className="form-control"
              name="client_key"
              onDone={ this.certChange }
            />
            <FormText color={ auth.client_key ? 'success' : 'muted' }>Client Key is { auth.client_key ? '' : 'not ' } set</FormText>
          </div>

        </div>
      </div>
    );
  }
}

Transport.propTypes = {
  change: PropTypes.func,
  index: PropTypes.number,
  data: PropTypes.object,
  orchestrator: PropTypes.shape({
    protocols: PropTypes.object,
    serializations: PropTypes.arrayOf(PropTypes.string)
  }),
  remove: PropTypes.func
};

Transport.defaultProps = {
  change: null,
  index: null,
  data: {},
  orchestrator: {
    protocols: {},
    serializations: []
  },
  remove: null
};

const mapStateToProps = state => ({
  orchestrator: {
    // ...state.Orcs.selected,
    protocols: state.Util.protocols,
    serializations: state.Util.serializations
  }
});

export default connect(mapStateToProps)(Transport);
