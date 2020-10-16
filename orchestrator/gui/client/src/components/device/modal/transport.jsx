import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import {
  Button, Input, Label
} from 'reactstrap';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';

import * as ProtocolOptions from './protocols';

export const defaultTransport = {
  transport_id: '',
  host: '127.0.0.1',
  port: 8080,
  protocol: 'HTTPS',
  serialization: ['JSON']
};

class Transport extends Component {
  constructor(props, context) {
    super(props, context);
    this.checkboxChange = this.checkboxChange.bind(this);
    this.protoChange = this.protoChange.bind(this);
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

  protoChange(data) {
    this.setState(
      data,
      () => {
        const { change, index } = this.props;
        change(this.state, index);
      }
    );
  }

  checkboxChange(e) {
    const { checked, id, name } = e.target;
    const item = id.replace(/^checkbox_\d+_/, '');
    // eslint-disable-next-line react/destructuring-assignment, react/no-access-state-in-setstate
    const tmpVal = this.state[name];
    const idx = tmpVal.indexOf(item);

    if (checked) {
      if (idx === -1) {
        tmpVal.push(item);
      }
    } else if (idx >= 0 && tmpVal.length > 1) {
      tmpVal.splice(idx, 1);
    }

    this.setState(
      {
        [name]: tmpVal
      },
      () => {
        const { change, index } = this.props;
        change(this.state, index);
      }
    );
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
      tmpState[name] = value;
    }

    this.setState(
      tmpState,
      () => {
        const { change, index } = this.props;
        change(this.state, index);
      }
    );
  }

  render() {
    const { orchestrator } = this.props;
    const {
      host, port, protocol, serialization
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

    let options = '';
    // ProtocolOptions
    if (protocol in ProtocolOptions) {
      const ProtoOpts = ProtocolOptions[protocol];
      options = <ProtoOpts data={ this.state } change={ this.protoChange } />;
    }

    return (
      <div className="position-relative border border-primary mb-2 p-2">
        <Button color="danger" size="sm" className="position-absolute" style={{ right: '1em', zIndex: 100}} onClick={ this.transportRemove } >
          <FontAwesomeIcon icon={ faTimes } />
        </Button>

        <fieldset className="border border-info p-2">
          <legend>Connection</legend>
          <div className="form-row m-0 p-0">
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
        </fieldset>

        <fieldset className="border border-info p-2">
          <legend>Serialization</legend>
          <div className="form-row m-0 p-0">
            <div className="form-group col-12">
              { serializations }
            </div>
          </div>
        </fieldset>

        { options }
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
  change: () => {},
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
