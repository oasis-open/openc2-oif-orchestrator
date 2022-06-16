import React from 'react';
import {
  Button, ButtonGroup, Input, Label
} from 'reactstrap';
import Auth from './auth';
import BaseOptions, { BaseOptionsProps, BaseOptionsState } from './base';
import { pick, removeEmpty } from '../../../utils';

// Interfaces
// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface HTTPSProps extends BaseOptionsProps {}

interface HTTPSState extends BaseOptionsState {
  path: string;
  prod: boolean;
}

// Component
const DefaultState: HTTPSState = {
  path: '',
  prod: false
};

class HTTPSOptions extends BaseOptions<HTTPSProps, HTTPSState> {
  constructor(props: HTTPSProps) {
    super(props);
    this.valueToggle = this.valueToggle.bind(this);
    const { data } = this.props;

    this.state = {
      ...DefaultState,
      ...pick(data, Object.keys(DefaultState))
    };
  }

  cleanState() {
    return removeEmpty(this.state);
  }

  valueToggle(e: any) {
    const { name } = e.target;
    this.setState(prevState => ({
        [name]: !prevState[name]
      } as Record<keyof HTTPSState, any>),
      this.onStateChange
    );
  }

  render() {
    const { data } = this.props;
    const { path, prod } = this.state;

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
            <div className="form-group col-lg-4">
              <Label for="prod">Security</Label>
              <ButtonGroup role="group">
                <Button
                  className="form-control"
                  as="checkbox"
                  color={ prod ? 'success' : 'dark' }
                  checked={ prod }
                  onClick={ this.valueToggle }
                  name="prod"
                >
                  Production
                </Button>
                <Button
                  className="form-control"
                  as="checkbox"
                  color={ prod ? 'dark' : 'warning' }
                  checked={ !prod }
                  onClick={ this.valueToggle }
                  name="prod"
                >
                  Testing
                </Button>
              </ButtonGroup>
              <small className='form-text text-muted'>Default: &lsquo;Development&rsquo;</small>
            </div>
          </div>
        </fieldset>

        <Auth data={ data } change={ this.onChange } />
      </div>
    );
  }
}

export default HTTPSOptions;