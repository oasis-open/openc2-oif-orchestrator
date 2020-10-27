import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { createBrowserHistory } from 'history';
import { connect } from 'react-redux';
import { Helmet } from 'react-helmet-async';
import { Button, ButtonGroup } from 'reactstrap';

import {
  CommandTable,
  CommandInfo,
  GenerateCommands
} from './pages';

import * as CommandActions from '../../actions/command';

class Commands extends Component {
  constructor(props, context) {
    super(props, context);
    this.commandInfo = this.commandInfo.bind(this);
    this.validPages = ['', 'info', 'generate'];
    this.commandUpdate = null;
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

  shouldComponentUpdate(nextProps, nextState) {
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

  getContent(page, command) {
    let content = [];
    switch (page) {
      case 'generate':
        content = [
          <h3 key="header">Command Generator</h3>,
          <GenerateCommands key="contents" />
        ];
        break;
      case 'info':
        content = [
          <h3 key="header">{ `Command ${command} Info` }</h3>,
          <CommandInfo key="contents" command_id={ command } />
        ];
        break;
      default:
        content = [
          <h3 key="header">Commands</h3>,
          <CommandTable key="contents" cmdInfo={ this.commandInfo } />
        ];
        break;
    }
    return (
      <div className="col-12">
        { content }
      </div>
    );
  }

  commandInfo(cmd) {
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
        className={ `${interval === updateInterval ? 'active' : ''}` }
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
    const selectedPage = this.validPages.includes(page) ? page : '';

    const meta = {
      title: `${siteTitle} | Command ${selectedPage}`,
      canonical: `${window.location.origin}${window.location.pathname}`
    };

    return (
      <div className="row mx-auto">
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

Commands.propTypes = {
  getCommands: PropTypes.func.isRequired,
  history: PropTypes.objectOf(createBrowserHistory).isRequired,
  match: PropTypes.shape({
    params: PropTypes.shape({
      command: PropTypes.string,
      page: PropTypes.string
    })
  }).isRequired,
  siteTitle: PropTypes.string
};

Commands.defaultProps = {
  siteTitle: ''
};

const mapStateToProps = state => ({
  siteTitle: state.Util.site_title
});

const mapDispatchToProps = dispatch => ({
  getCommands: (page, sizePerPage, sort) => dispatch(CommandActions.getCommands(page, sizePerPage, sort))
});

export default connect(mapStateToProps, mapDispatchToProps)(Commands);
