import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { createBrowserHistory } from 'history';
import { connect } from 'react-redux';
import { Helmet } from 'react-helmet-async';
import { Button } from 'reactstrap';

import {
  ConformanceInfo,
  ConformanceTable,
  // ConformanceTest,
  UnittestTable
} from './pages';

import * as ConformanceActions from '../../actions/conformance';

class Conformance extends Component {
  constructor(props, context) {
    super(props, context);
    this.conformanceInfo = this.conformanceInfo.bind(this);
    this.validPages = ['', 'info', 'test', 'unittests'];
    this.conformanceUpdate = null;
    this.updateIntervals = [10, 15, 20, 25, 30];

    this.state = {
      updateInterval: 30 // seconds
    };
  }

  componentDidMount() {
    this.conformanceUpdate = setInterval(this.props.getConformanceTests, this.state.updateInterval * 1000);
  }

  shouldComponentUpdate(nextProps, nextState) {
    const propsUpdate = this.props !== nextProps;
    const stateUpdate = this.state !== nextState;

    if (stateUpdate) {
      clearInterval(this.commandUpdate);
      this.conformanceUpdate = setInterval(this.props.getConformanceTests, nextState.updateInterval * 1000);
    }

    return propsUpdate || stateUpdate;
  }

  componentWillUnmount() {
    clearInterval(this.conformanceUpdate);
  }

  conformanceInfo(cmd) {
    this.props.history.push({
      pathname: `/conformance/info/${cmd}`
    });
  }

  getContent(page, testID) {
    let content = [];
    switch (page) {
      case 'info':
        content = (
          <h1>Conformance Test { testID } Info</h1>,
          <ConformanceInfo test_id={ testID } />
        );
        break;
      case 'unittests':
        content = (
          <h1>Unit Tests</h1>,
          <UnittestTable />
        );
        break;
      case 'test':
        content = (
          <h1>Conformance Test</h1>
        );
        break;
      default:
        content = (
          <h1>Conformance Tests</h1>,
          <ConformanceTable confInfo={ this.conformanceInfo } />
        );
        break;
    }
    return (
      <div className="col-12">
        { content }
      </div>
    );
  }

  updateIntervalOptions() {
    const options = this.updateIntervals.map(interval => (
      <li key={ interval }>
        <a
          href='#'
          className={ `dropdown-item ${interval === this.state.updateInterval ? 'active' : ''}` }
          onClick={ () => this.setState({ updateInterval: interval }) }
        >
          { interval === this.state.updateInterval ? '* ' : '' }{ interval }
        </a>
      </li>
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

        <ul className='dropdown-menu'>
          { options }
        </ul>
      </div>
    );
  }

  render() {
    const { page, id } = this.props.match.params;
    const selectedPage = this.validPages.indexOf(page) ===  -1 ? '' : page;

    const meta = {
      title: `${this.props.siteTitle} | Conformance ${selectedPage}`,
      canonical: `${window.location.origin}${window.location.pathname}`
    };

    return (
     <div className="row mx-auto">
        <Helmet>
          <title>{ meta.title }</title>
          <link rel="canonical" href={ meta.canonical } />
        </Helmet>
        { this.getContent(selectedPage, id) }
        { this.updateIntervalOptions() }
      </div>
    );
  }
}

Conformance.propTypes = {
  history: PropTypes.objectOf(createBrowserHistory).isRequired,
  match: PropTypes.shape({
    params: PropTypes.shape({
      id: PropTypes.string,
      page: PropTypes.string
    })
  }).isRequired,
  getConformanceTests: PropTypes.func.isRequired,
  siteTitle: PropTypes.string
};

Conformance.defaultProps = {
  siteTitle: ''
};

const mapStateToProps = state => ({
  siteTitle: state.Util.site_title
});

const mapDispatchToProps = dispatch => ({
  getConformanceTests: () => dispatch(ConformanceActions.getConformanceTests())
});

export default connect(mapStateToProps, mapDispatchToProps)(Conformance);
