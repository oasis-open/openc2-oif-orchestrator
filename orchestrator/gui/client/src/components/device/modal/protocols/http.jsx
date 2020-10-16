import React from 'react';
import PropTypes from 'prop-types';
import { Input, Label } from 'reactstrap';

import BaseOptions from './base';
import { pick, removeEmpty } from '../../../utils';

const defaultState = {
  path: ''
};

class HTTPSOptions extends BaseOptions {
  constructor(props, context) {
    super(props, context);
    const { data } = this.props;

    this.state = {
      ...defaultState,
      ...pick(data, Object.keys(defaultState))
    };
  }

  cleanState() {
    return removeEmpty(this.state);
  }

  render() {
    const { path } = this.state;

    return (
      <div>
        <fieldset className="border border-info p-2">
          <legend>HTTP Options</legend>

          <div className="form-row">
            <div className="form-group col-lg-4">
              <Label for="path">Path</Label>
              <Input
                id="path"
                className="form-control"
                type="text"
                name="path"
                value={ path }
                onChange={ this.inputChange }
              />
              <small className='form-text text-muted'>Default: &lsquo;/&rsquo;</small>
            </div>
          </div>
        </fieldset>
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