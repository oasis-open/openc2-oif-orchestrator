import React from 'react';
import { Input, Label } from 'reactstrap';
import Auth from './auth';
import BaseOptions, { BaseOptionsProps, BaseOptionsState } from './base';
import { pick } from '../../../utils';

// Interfaces
// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface MQTTProps extends BaseOptionsProps {}

interface MQTTState extends BaseOptionsState {
  prefix: string;
  broadcastTopic: string;
  deviceTopic: string;
  profileTopic: string;
  responseTopic: string;
}

// Component
const DefaultState: MQTTState = {
  prefix: '',
  broadcastTopic: '',
  deviceTopic: '',
  profileTopic: '',
  responseTopic: ''
};

class MQTTOptions extends BaseOptions<MQTTProps, MQTTState> {
  initial: Partial<MQTTState>;

  constructor(props: MQTTProps) {
    super(props);
    const { data } = this.props;
    this.initial = pick(data, Object.keys(DefaultState));

    this.state = {
      ...DefaultState,
      ...this.initial
    };
  }

  cleanState(data: MQTTState) {
    const stateChange: Partial<MQTTState> = {};
    Object.keys(DefaultState).forEach(i => {
      const k = i as keyof MQTTState;
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
      broadcastTopic, deviceTopic, profileTopic, responseTopic, prefix
    } = this.state;

    return (
      <div>
        <fieldset className="border border-info p-2">
          <legend>MQTT Options</legend>
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

            <div className="form-group col-lg-6">
              <Label for="broadcastTopic">Broadcast Topic</Label>
              <Input
                id="broadcastTopic"
                className="form-control"
                type="text"
                name="broadcastTopic"
                value={ broadcastTopic }
                onChange={ this.inputChange }
              />
              <small className='form-text text-muted'>Default: &lsquo;&#123;prefix&#125;oc2/cmd/all&rsquo;</small>
            </div>

            <div className="col-12" />

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
              <Label for="deviceTopic">Device Topic</Label>
              <Input
                id="deviceTopic"
                className="form-control"
                type="text"
                name="deviceTopic"
                value={ deviceTopic }
                onChange={ this.inputChange }
              />
              <small className='form-text text-muted'>Default: &lsquo;&#123;prefix&#125;oc2/cmd/device/&#123;device_id&#125;&rsquo;</small>
            </div>
            <div className="form-group col-lg-4">
              <Label for="profileTopic">Profile Topic</Label>
              <Input
                id="profileTopic"
                className="form-control"
                type="text"
                name="profileTopic"
                value={ profileTopic }
                onChange={ this.inputChange }
              />
              <small className='form-text text-muted'>Default: &lsquo;&#123;prefix&#125;oc2/cmd/ap/&#123;profile&#125;&rsquo;</small>
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
                <li>
                  <strong>profile</strong>
                  &nbsp;- profile of the actuator to recieve the message
                </li>
              </ul>
            </small>
          </div>
        </fieldset>

        <Auth data={ data } change={ this.onChange } />
      </div>
    );
  }
}

export default MQTTOptions;