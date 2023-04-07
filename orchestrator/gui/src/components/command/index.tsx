import React, { Component } from 'react';
import { Dispatch } from 'redux';
import { ConnectedProps, connect } from 'react-redux';
import classNames from 'classnames';
import { History } from 'history';
import { Helmet } from 'react-helmet-async';
import { Button, ButtonGroup } from 'reactstrap';
import { CommandTable, CommandInfo, GenerateCommands } from './pages';
import * as CommandActions from '../../actions/command';
import { RootState } from '../../reducers';

// Interfaces
type Page = '' | 'info' | 'generate';
interface CommandsProps {
  history: History,
  match: {
    params: {
      command?: string;
      page?: Page;
    }
  };
}

interface CommandsState {
  updateInterval: number;
}

// Redux Connector
const mapStateToProps = (state: RootState) => ({
  siteTitle: state.Util.site_title
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
  getCommands: (page: number, count: number, sort: string) => dispatch(CommandActions.getCommands({page, count, sort}))
});

const connector = connect(mapStateToProps, mapDispatchToProps);
type ConnectorProps = ConnectedProps<typeof connector>;
type CommandsConnectedProps = CommandsProps & ConnectorProps;

// Component
class Commands extends Component<CommandsConnectedProps, CommandsState> {
  validPages: Array<Page>;
  commandUpdate?: number;
  updateIntervals: Array<number>;

  constructor(props: CommandsConnectedProps) {
    super(props);
    this.commandInfo = this.commandInfo.bind(this);
    this.validPages = ['', 'info', 'generate'];
    this.updateIntervals = [5, 10, 15, 20, 25, 30];

    this.state = {
      updateInterval: 10 // seconds
    };
  }

  componentDidMount() {
    const { getCommands } = this.props;
    const { updateInterval } = this.state;

    // eslint-disable-next-line @typescript-eslint/no-implied-eval
    this.commandUpdate = setInterval(getCommands, updateInterval * 1000);
  }

  shouldComponentUpdate(nextProps: CommandsConnectedProps, nextState: CommandsState) {
    const propsUpdate = this.props !== nextProps;
    const stateUpdate = this.state !== nextState;

    if (stateUpdate) {
      const { getCommands } = this.props;

      clearInterval(this.commandUpdate);
      // eslint-disable-next-line @typescript-eslint/no-implied-eval
      this.commandUpdate = setInterval(getCommands, nextState.updateInterval * 1000);
    }

    return propsUpdate || stateUpdate;
  }

  componentWillUnmount() {
    clearInterval(this.commandUpdate);
  }

  getContent(page?: Page, command?: string) {
    let content = [];
    switch (page) {
      case 'generate':
        content = [
          <h4 key="header">Command Generator</h4>,
          <GenerateCommands key="contents" />
        ];
        break;
      case 'info':
        content = [
          <h4 key="header">{ `Command ${command} Info` }</h4>,
          <CommandInfo key="contents" command_id={ command || '' } />
        ];
        break;
      default:
        content = [
          <h4 key="header">Previous Commands</h4>,
          <CommandTable key="contents" cmdInfo={ this.commandInfo } />
        ];
        break;
    }
    return (
      <div className="card p-2">
        <div className='row'>
          <div className="col">
            { content }
          </div>
        </div>
      </div>
    );
  }

  commandInfo(cmd: string) {
    const { history } = this.props;

    history.push({
      pathname: `/command/info/${cmd}`
    });
  }

  updateIntervalOptions() {
    const { updateInterval } = this.state;

    const options = this.updateIntervals.map(interval => (
      <Button
        key={ interval }
        color='info'
        className={ classNames({ 'active': interval === updateInterval }) }
        onClick={ () => this.setState({ updateInterval: interval }) }
      >
        { `${interval === updateInterval ? '* ' : ''}${interval}` }
      </Button>
    ));

    return (
      <div
        className='dropdown dropdown-menu-right'
        style={{
          position: 'fixed',
          bottom: '5px',
          left: '5px'
        }}
      >
        <Button
          color='default'
          size='sm'
          className='dropdown-toggle'
          data-toggle='dropdown'
          aria-haspopup='true'
          aria-expanded='true'
        >
          Update Intervals
        </Button>

        <div className='dropdown-menu p-0'>
          <ButtonGroup size='sm' vertical className='w-100'>
            { options }
          </ButtonGroup>
        </div>
      </div>
    );
  }

  render() {
    const { match, siteTitle } = this.props;
    const { page, command } = match.params;
    const selectedPage = page && this.validPages.includes(page) ? page : '';

    const meta = {
      title: `${siteTitle} | Command ${selectedPage}`,
      canonical: `${window.location.origin}${window.location.pathname}`
    };

    return (
      <div className="mx-auto">
        <Helmet>
          <title>{ meta.title }</title>
          <link rel="canonical" href={ meta.canonical } />
        </Helmet>
        { this.getContent(selectedPage, command) }
        { this.updateIntervalOptions() }
      </div>
    );
  }
}

export default connector(Commands);
