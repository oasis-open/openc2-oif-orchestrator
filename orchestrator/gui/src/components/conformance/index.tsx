import React, { Component } from 'react';
import { Dispatch } from 'redux';
import { ConnectedProps, connect } from 'react-redux';
import classNames from 'classnames';
import { History } from 'history';
import { Helmet } from 'react-helmet-async';
import { Button } from 'reactstrap';
import {
  ConformanceInfo, ConformanceTable, ConformanceTest, UnittestTable
} from './pages';
import * as ConformanceActions from '../../actions/conformance';
import { RootState } from '../../reducers';

// Interfaces
type ValidPage = '' | 'info' | 'test' | 'unittests';
interface ConformanceProps {
  history: History,
  match: {
    params: {
      id?: string;
      page?: ValidPage;
    }
  };
}

interface ConformanceState {
  updateInterval: number
}

// Redux Connector
const mapStateToProps = (state: RootState) => ({
  siteTitle: state.Util.site_title
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
  getConformanceTests: () => dispatch(ConformanceActions.getConformanceTests())
});

const connector = connect(mapStateToProps, mapDispatchToProps);
type ConnectorProps = ConnectedProps<typeof connector>;
type ConformanceConnectedProps = ConformanceProps & ConnectorProps;

// Component
class Conformance extends Component<ConformanceConnectedProps, ConformanceState> {
  validPages: Array<ValidPage>;
  conformanceUpdate?: NodeJS.Timeout;
  updateIntervals: Array<number>;

  constructor(props: ConformanceConnectedProps) {
    super(props);
    this.conformanceInfo = this.conformanceInfo.bind(this);
    this.validPages = ['', 'info', 'test', 'unittests'];
    this.updateIntervals = [10, 15, 20, 25, 30];

    this.state = {
      updateInterval: 30 // seconds
    };
  }

  componentDidMount() {
    const { getConformanceTests } = this.props;
    const { updateInterval } = this.state;
    // eslint-disable-next-line @typescript-eslint/no-implied-eval
    this.conformanceUpdate = setInterval(getConformanceTests, updateInterval * 1000);
  }

  shouldComponentUpdate(nextProps: ConformanceConnectedProps, nextState: ConformanceState) {
    const propsUpdate = this.props !== nextProps;
    const stateUpdate = this.state !== nextState;

    if (stateUpdate) {
      if (this.conformanceUpdate) {
        clearInterval(this.conformanceUpdate);
      }
      const { getConformanceTests } = this.props;
      // eslint-disable-next-line @typescript-eslint/no-implied-eval
      this.conformanceUpdate = setInterval(getConformanceTests, nextState.updateInterval * 1000);
    }

    return propsUpdate || stateUpdate;
  }

  componentWillUnmount() {
    if (this.conformanceUpdate) {
      clearInterval(this.conformanceUpdate);
    }
  }

  getContent(page: ValidPage, testID?: string) {
    let content = [];
    switch (page) {
      case 'info':
        content = [
          <h3 key="header">{ `Conformance Test ${testID} Info` }</h3>,
          <ConformanceInfo key="content" test_id={ testID || '' } />
        ];
        break;
      case 'unittests':
        content = [
          <h3 key="header">Unit Tests</h3>,
          <UnittestTable key="content" />
        ];
        break;
      case 'test':
        content = [
          <h3 key="header">Conformance Test</h3>,
          <ConformanceTest key="content" />
        ];
        break;
      default:
        content = [
          <h3 key="header">Conformance Tests</h3>,
          <ConformanceTable key="content" confInfo={ this.conformanceInfo } />
        ];
        break;
    }
    return (
      <div className="col-12">
        { content }
      </div>
    );
  }

  conformanceInfo(cmd: string) {
    const { history } = this.props;
    history.push({
      pathname: `/conformance/info/${cmd}`
    });
  }

  updateIntervalOptions() {
    const { updateInterval } = this.state;
    const options = this.updateIntervals.map(interval => (
      <li key={ interval }>
        <Button
          color="link"
          className={ classNames('dropdown-item', { 'active': interval === updateInterval }) }
          onClick={ () => this.setState({ updateInterval: interval }) }
        >
          { interval === updateInterval ? '* ' : '' }
          { interval }
        </Button>
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
    const { match, siteTitle } = this.props;
    const { page, id } = match.params;
    const selectedPage = page && this.validPages.includes(page) ? page : '';

    const meta = {
      title: `${siteTitle} | Conformance ${selectedPage}`,
      canonical: `${window.location.origin}${window.location.pathname}`
    };

    return (
      <div className="row mx-auto">
        <Helmet>
          <title>{ meta.title }</title>
          <link rel="canonical" href={ meta.canonical } />
        </Helmet>
        <div className="corner-ribbon top-left sticky red opacity-9 shadow">Beta Features</div>
        { this.getContent(selectedPage, id) }
        { this.updateIntervalOptions() }
      </div>
    );
  }
}

export default connector(Conformance);
