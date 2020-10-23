// eslint-disable-next-line no-unused-vars
import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { isFunction } from '../../../utils';

class BaseOptions extends Component {
  constructor(props, context) {
    super(props, context);
    this.inputChange = this.inputChange.bind(this);
    this.onChange = this.onChange.bind(this);
    this.onStateChange = this.onStateChange.bind(this);
    this.mounted = false;
  }

  componentDidMount() {
    this.mounted = true;
  }

  shouldComponentUpdate(nextProps, nextState) {
    const propsUpdate = this.props !== nextProps;
    if (propsUpdate && this.mounted) {
      const { data } = this.props;
      // eslint-disable-next-line no-param-reassign
      nextState = {
        ...nextState,
        ...data
      };
    }

    const stateUpdate = this.state !== nextState;
    return propsUpdate || stateUpdate;
  }

  componentWillUnmount() {
    this.mounted = false;
  }

  onChange(data) {
    this.setState(
      data,
      this.onStateChange
    );
  }

  onStateChange() {
    const { change } = this.props;
    const nextState = isFunction(this.cleanState) ? this.cleanState(this.state) : this.state;
    change(nextState);
  }

  inputChange(e) {
    const { name, value } = e.target;
    this.setState(
      {
        [name]: name.startsWith('password') ? btoa(value) : value
      },
      this.onStateChange
    );
  }
}

BaseOptions.propTypes = {
  change: PropTypes.func,
  data: PropTypes.object
};

BaseOptions.defaultProps = {
  change: () => {},
  data: {}
};

export default BaseOptions;