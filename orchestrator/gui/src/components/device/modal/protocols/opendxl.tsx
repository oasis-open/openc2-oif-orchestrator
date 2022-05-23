import React from 'react';
import { Input, Label } from 'reactstrap';
import Auth, { AuthState, DefaultState as DefaultAuthState } from './auth';
import BaseOptions, { BaseOptionsProps } from './base';
import { pick } from '../../../utils';

// Interfaces
// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface OpenDxlProps extends BaseOptionsProps {}

interface OpenDxlState extends AuthState {
  prefix: string;
  requestTopic: string;
  responseTopic: string;
  serviceTopic: string;
}

// Component
const DefaultState: OpenDxlState = {
  prefix: '',
  requestTopic: '',
  responseTopic: '',
  serviceTopic: '',
  ...DefaultAuthState
};

class OpenDxlOptions extends BaseOptions<OpenDxlProps, OpenDxlState> {
  initial: Partial<OpenDxlState>;

  constructor(props: OpenDxlProps) {
    super(props);
    const { data } = this.props;
    this.onChange = this.onChange.bind(this);
    this.initial = pick(data, Object.keys(DefaultState));

    this.state = {
      ...DefaultState,
      ...this.initial
    };
  }

  cleanState(data: OpenDxlState) {
    const stateChange: Partial<OpenDxlState> = {};
    Object.keys(DefaultState).forEach(i => {
      const k = i as keyof OpenDxlState;
      if (this.initial[k] !== data[k]) {
        Object.assign(
          stateChange,
          { [k]: data[k] }
        );
      }
    });
    return stateChange;
  }

  render() {
    const { data } = this.props;
    const {
      requestTopic, responseTopic, serviceTopic, prefix
    } = this.state;

    return (
      <div>
        <fieldset className="border border-info p-2">
          <legend>OpenDxl Options</legend>
          <div className="form-row">
            <div className="form-group col-lg-6">
              <Label for="username">Topic Prefix</Label>
              <Input
                id="prefix"
                className="form-control"
                type="text"
                name="prefix"
                value={ prefix }
                onChange={ this.inputChange }
              />
            </div>

            <div className="col-12" />

            <div className="form-group col-lg-4">
              <Label for="requestTopic">Request Topic</Label>
              <Input
                id="requestTopic"
                className="form-control"
                type="text"
                name="requestTopic"
                value={ requestTopic }
                onChange={ this.inputChange }
              />
              <small className='form-text text-muted'>Default: &lsquo;&#123;prefix&#125;oc2/cmd&rsquo;</small>
            </div>
            <div className="form-group col-lg-4">
              <Label for="responseTopic">Response Topic</Label>
              <Input
                id="responseTopic"
                className="form-control"
                type="text"
                name="responseTopic"
                value={ responseTopic }
                onChange={ this.inputChange }
              />
              <small className='form-text text-muted'>Default: &lsquo;&#123;prefix&#125;oc2/rsp&rsquo;</small>
            </div>
            <div className="form-group col-lg-4">
              <Label for="serviceTopic">Service Topic</Label>
              <Input
                id="serviceTopic"
                className="form-control"
                type="text"
                name="serviceTopic"
                value={ serviceTopic }
                onChange={ this.inputChange }
              />
              <small className='form-text text-muted'>Default: &lsquo;&#123;prefix&#125;oc2&rsquo;</small>
            </div>

            <small className='form-text text-muted ml-2'>
              <p className="mb-1">All topics will have the following variables, with the default of an empty string</p>
              <ul>
                <li>
                  <strong>prefix</strong>
                  &nbsp;- User defined prefix for all topics
                </li>
                <li>
                  <strong>device_id</strong>
                  &nbsp;- ID of the device to recieve the message
                </li>
              </ul>
            </small>
          </div>
        </fieldset>

        <Auth data={ data } change={ this.onChange } noLogin />
      </div>
    );
  }
}

export default OpenDxlOptions;