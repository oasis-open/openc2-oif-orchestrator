import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Input, Label } from 'reactstrap';

import Auth from './auth';
import { removeEmpty } from '../../../utils';

const defaultOptions = {};

class HTTPSOptions extends Component {
  constructor(props, context) {
    super(props, context);
    this.onChange = this.onChange.bind(this);
    this.inputChange = this.inputChange.bind(this);

    const { data } = this.props;

    this.state = {
      ...defaultOptions,
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
        this.setState({
          ...defaultOptions,
          ...data
        });
      }, 10);
    }

    return propsUpdate || stateUpdate;
  }

  componentWillUnmount() {
    this.mounted = false;
  }

  onChange(d) {
    const data = removeEmpty(d || this.state);
    this.setState(data, () => {
      const { change } = this.props;
      change(data);
    });
  }

  inputChange(e) {
    const { name, value } = e.target;
    this.setState({
      [name]: name.startsWith('password') ? btoa(value) : value
    }, () => {
      this.onChange();
    });
  }

  render() {
    const {
      broadcastTopic, deviceTopic, profileTopic, responseTopic, prefix
    } = this.state;

    return (
      <div>
        <fieldset className="border border-info p-2">
          <legend>HTTPS Options</legend>
          <p>Not applicable at this time</p>
        </fieldset>

        <Auth data={ this.state } change={ this.onChange } />
      </div>
    );
  }
}

HTTPSOptions.propTypes = {
  change: PropTypes.func,
  data: PropTypes.object
};

HTTPSOptions.defaultProps = {
  change: () => {},
  data: {}
};

export default HTTPSOptions;