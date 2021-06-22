import React from 'react';
import { Input, Label } from 'reactstrap';
import Auth from './auth';
import BaseOptions, { BaseOptionsProps, BaseOptionsState } from './base';
import { pick, removeEmpty } from '../../../utils';

// Interfaces
// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface HTTPSProps extends BaseOptionsProps {}

interface HTTPSState extends BaseOptionsState {
  path: string;
}

// Component
const DefaultState: HTTPSState = {
  path: ''
};

class HTTPSOptions extends BaseOptions<HTTPSProps, HTTPSState> {
  constructor(props: HTTPSProps) {
    super(props);
    const { data } = this.props;

    this.state = {
      ...DefaultState,
      ...pick(data, Object.keys(DefaultState))
    };
  }

  cleanState() {
    return removeEmpty(this.state);
  }

  render() {
    const { data } = this.props;
    const { path } = this.state;

    return (
      <div>
        <fieldset className="border border-info p-2">
          <legend>HTTPS Options</legend>

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

        <Auth data={ data } change={ this.onChange } />
      </div>
    );
  }
}

export default HTTPSOptions;