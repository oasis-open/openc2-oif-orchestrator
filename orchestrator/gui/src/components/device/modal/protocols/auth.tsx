import React, { ReactElement } from 'react';
import { FormText, Input, Label } from 'reactstrap';
import BaseOptions, { BaseOptionsProps, BaseOptionsState } from './base';
import { FileBase64, FileInfo, pick } from '../../../utils';

// Interfaces
interface AuthProps extends BaseOptionsProps {
  noLogin: boolean;
  noCerts: boolean;
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface NullAuth {}

interface BasicAuth {
  username: string;
  password1: string;
  password2: string;
}

interface CertAuth {
  ca_cert?: string;
  client_cert: string;
  client_key: string;
}

type AuthOptions = NullAuth | BasicAuth | CertAuth | (BasicAuth & CertAuth)

export type AuthState = BaseOptionsState & AuthOptions & {
  auth: {
    password: boolean;
    ca_cert: boolean;
    client_cert: boolean;
    client_key: boolean;
  };
}

// Component
export const DefaultState: AuthState = {
  username: '',
  password1: '',
  password2: '',
  auth: {
    password: false,
    ca_cert: false,
    client_cert: false,
    client_key: false
  }
};

class Auth extends BaseOptions<AuthProps, AuthState> {
  // eslint-disable-next-line react/static-property-placement
  static defaultProps = {
    noLogin: false,
    noCerts: false
  }

  initial: Partial<AuthState>;

  constructor(props: AuthProps) {
    super(props);
    this.certChange = this.certChange.bind(this);
    const { data } = this.props;
    this.initial = pick(data, Object.keys(DefaultState));

    this.state = {
      ...DefaultState,
      ...this.initial
    };
  }

  cleanState(data: AuthState) {
    const stateChange: Partial<AuthState> = {};
    Object.keys(DefaultState).forEach(i => {
      const k = i as keyof AuthState;
      if (this.initial[k] !== data[k]) {
        Object.assign(
          stateChange,
          { [k]: data[k] }
        );
      }
    });
    return stateChange;
  }

  certChange(file: FileInfo|Array<FileInfo>) {
    if (!Array.isArray(file)) {
      const { base64, id } = file;
      this.setState(
        {
          [id]: base64
        } as Record<keyof AuthState, any>,
        this.onStateChange
      );
    }
  }

  render() {
    const { noCerts, noLogin } = this.props;
    const {
      auth, password1, password2, username
    } = this.state;
    let certFields: null|ReactElement = null;
    let loginFields: null|ReactElement = null;

    if (!noCerts) {
      certFields = (
        <div className="form-row">
          <div className="form-group col-lg-4">
            <Label for="ca_cert">CA Certificate</Label>
            <FileBase64
              id="ca_cert"
              className="form-control"
              name="ca_cert"
              onDone={ this.certChange }
            />
            <small className='form-text text-info'>Only use unencrypted &lsquo;.cert&rsquo; files</small>
            <FormText color={ auth.ca_cert ? 'success' : 'muted' }>{ `CA Certificate is ${auth.ca_cert ? '' : 'not '} set` }</FormText>
          </div>
          <div className="form-group col-lg-4">
            <Label for="client_cert">Client Certificate</Label>
            <FileBase64
              id="client_cert"
              className="form-control"
              name="client_cert"
              onDone={ this.certChange }
            />
            <small className='form-text text-info'>Only use unencrypted &lsquo;.cert&rsquo; files</small>
            <FormText color={ auth.client_cert ? 'success' : 'muted' }>{ `Client Certificate is ${auth.client_cert ? '' : 'not '} set` }</FormText>
          </div>
          <div className="form-group col-lg-4">
            <Label for="client_key">Client Key</Label>
            <FileBase64
              id="client_key"
              className="form-control"
              name="client_key"
              onDone={ this.certChange }
            />
            <small className='form-text text-info'>Only use unencrypted &lsquo;.key&rsquo; files</small>
            <FormText color={ auth.client_key ? 'success' : 'muted' }>{ `Client Key is ${auth.client_key ? '' : 'not '} set` }</FormText>
          </div>
        </div>
      );
    }

    if (!noLogin) {
      loginFields = (
        <div className="form-row">
          <div className="form-group col-lg-4">
            <Label for="username">Username</Label>
            <Input
              id="username"
              className="form-control"
              type="text"
              name="username"
              value={ username }
              onChange={ this.inputChange }
            />
          </div>
          <div className="form-group col-lg-4">
            <Label for="password1">Password</Label>
            <Input
              id="password1"
              className="form-control"
              type="password"
              name="password1"
              value={ atob(password1 || '') }
              onChange={ this.inputChange }
            />
            <FormText color={ auth.password ? 'success' : 'muted' }>{ `Password is ${auth.password ? '' : 'not '} set` }</FormText>
          </div>
          <div className="form-group col-lg-4">
            <Label for="password2">Password Confirmation</Label>
            <Input
              id="password2"
              className="form-control"
              type="password"
              name="password2"
              value={ atob(password2 || '') }
              onChange={ this.inputChange }
            />
          </div>
        </div>
      );
    }

    return (
      <fieldset className="border border-info p-2">
        <legend>Authentication</legend>
        { loginFields || '' }
        { certFields  || ''}
      </fieldset>
    );
  }
}

export default Auth;
