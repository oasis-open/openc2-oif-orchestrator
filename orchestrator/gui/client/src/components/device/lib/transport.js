import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Button, Input, Label } from 'reactstrap';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';

class Transport extends Component {
  constructor(props, context) {
    super(props, context);
    this.checkboxChange = this.checkboxChange.bind(this);
    this.transportRemove = this.transportRemove.bind(this);
    this.transportChange = this.transportChange.bind(this);

    this.state = {
      host: '127.0.0.1',
      port: 8080,
      protocol: 'HTTPS',
      serialization: ['JSON'],
      ...this.props.data
    };
  }

  componentDidMount() {
    this.mounted = true;
  }

  shouldComponentUpdate(nextProps, nextState) {
    const propsUpdate = this.props !== nextProps;
    const stateUpdate = this.state !== nextState;

    if (propsUpdate && this.mounted) {
      setTimeout(() => this.setState(this.props.data), 10);
    }

    return propsUpdate || stateUpdate;
  }

  componentWillUnmount() {
    this.mounted = false;
  }

  checkboxChange(e) {
    const name = e.target.name;
    const item = e.target.id.replace(/^checkbox_\d+_/, '');

    // eslint-disable-next-line react/no-access-state-in-setstate
    const tmpVal = this.state[name];
    const idx = tmpVal.indexOf(item);

    if (e.target.checked) {
      if (idx === -1) tmpVal.push(item);
    } else if (idx >= 0 && tmpVal.length > 1) {
      tmpVal.splice(idx, 1);
    }

    this.setState({
      [name]: tmpVal
    }, () => {
      this.props.change(this.state, this.props.index);
    });
  }

  transportRemove(e) {
    e.preventDefault();
    this.props.remove(this.props.index);
  }

  transportChange(e, reset=false) {
    let tmpState = {};
    if (reset) {
      tmpState = e;
    } else {
      tmpState[e.target.name] = e.target.value;
    }

    this.setState(
      tmpState,
      () => {
        this.props.change(this.state, this.props.index);
      }
    );
  }

  transportPubSub() {
    const protocols = Object.keys(this.props.orchestrator.protocols).map(p => (
      <option key={ p } value={ p }>{ p }</option>
    ));
    const pubSub = this.props.orchestrator.protocols[this.state.protocol];
    let channelTopic = '';
    let columns = 'col-6';

    if (pubSub) {
      columns = 'col-md-4 col-sm-12';
      channelTopic = [(
        <div key={ 0 } className={ `form-group ${columns}` }>
          <Label for="topic">Topic</Label>
          <Input
            id="topic"
            className="form-control"
            type="text"
            name="topic"
            value={ this.state.topic }
            onChange={ this.transportChange }
          />
        </div>), (
        <div key={ 1 } className={ `form-group ${columns}` }>
          <Label for="channel">Channel</Label>
          <Input
            id="channel"
            className="form-control"
            type="text"
            name="channel"
            value={ this.state.channel }
            onChange={ this.transportChange }
          />
        </div>
      )];
    }

    return (
      <div className="form-row">
        <div className={ `form-group ${columns}` }>
          <Label for="protocol">Protocol</Label>
          <select
            className="form-control"
            name="protocol"
            value={ this.state.protocol }
            onChange={ this.transportChange }
          >
            { protocols }
          </select>
        </div>
        { channelTopic }
      </div>
    );
  }

  render() {
    const serializations = this.props.orchestrator.serializations.map((s, i) => (
      <div key={ s } className="form-check-inline">
        <Label className="form-check-Label">
          <Input
            id={ `checkbox_${i}_${s}` }
            className="form-check-input"
            type="checkbox"
            name="serialization"
            checked={ this.state.serialization.indexOf(s) >= 0 }
            onChange={ this.checkboxChange }
          />
          { s }
        </Label>
      </div>
    ));

    return (
      <div className="border mb-2 p-2">
        <Button color="danger" size="sm" className="float-right" onClick={ this.transportRemove } >
          <FontAwesomeIcon
            icon={ faTimes }
          />
        </Button>
        <div className="form-row">
          <div className="form-group col-lg-6">
            <Label for="host">Host</Label>
            <Input
              id="host"
              className="form-control"
              type="text"
              name="host"
              value={ this.state.host }
              onChange={ this.transportChange }
            />
          </div>

          <div className="form-group col-lg-6">
            <Label for="port">Port</Label>
            <Input
              id="port"
              className="form-control"
              type="text"
              name="port"
              value={ this.state.port }
              onChange={ this.transportChange }
            />
          </div>
        </div>

        { this.transportPubSub() }

        <div className="form-row">
          <div className="form-group col-12">
            <div>
              <p>Serializations</p>
            </div>
            { serializations }
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
