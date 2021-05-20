import React from 'react';
import { Input, Label } from 'reactstrap';
import BaseOptions, { BaseOptionsProps, BaseOptionsState }  from './base';
import { pick, removeEmpty } from '../../../utils';

// Interfaces
// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface HTTPProps extends BaseOptionsProps {}

interface HTTPState extends BaseOptionsState {
  path: string;
}

// Component
const DefaultState: HTTPState = {
  path: ''
};

class HTTPSOptions extends BaseOptions<HTTPProps, HTTPState> {
  constructor(props: HTTPProps) {
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

export default HTTPSOptions;