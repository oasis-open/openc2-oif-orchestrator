import React, { Component } from 'react';

// Interfaces
export interface BaseOptionsProps {
  change: (data: Record<string, any>) => void;
  data: Record<string, any>;
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface BaseOptionsState {}

// Component
class BaseOptions<Props extends BaseOptionsProps, State extends BaseOptionsState> extends Component<Props, State> {
  mounted: boolean;

  constructor(props: Props) {
    super(props);
    this.inputChange = this.inputChange.bind(this);
    this.onChange = this.onChange.bind(this);
    this.onStateChange = this.onStateChange.bind(this);
    this.mounted = false;
  }

  componentDidMount() {
    this.mounted = true;
  }

  shouldComponentUpdate(nextProps: Props, nextState: State) {
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

  onChange(data: Partial<State>) {
    this.setState(
      data as Record<keyof State, any>,
      this.onStateChange
    );
  }

  onStateChange() {
    const { change } = this.props;
    change(this.cleanState(this.state));
  }

  // eslint-disable-next-line class-methods-use-this
  cleanState(data: State): Partial<State> {
    return data;
  }

  inputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    this.setState(
      {
        [name]: name.startsWith('password') ? btoa(value) : value
      } as Record<keyof State, any>,
      this.onStateChange
    );
  }

  render() {
    return (
      <p>Base Protocol Options</p>
    );
  }
}

export default BaseOptions;