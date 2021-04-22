import React, { FunctionComponent } from 'react';
import { Dispatch } from 'redux';
import { ConnectedProps, connect } from 'react-redux';
import { Redirect } from 'react-router';
import { Badge, ListGroup, ListGroupItem } from 'reactstrap';
import { iso2local, safeGet, titleCase } from '../../utils';
import { Conformance } from '../../../actions';
import { RootState } from '../../../reducers';

// Interfaces
interface ConformanceInfoProps {
  test_id: string
}

// Redux Connector
const mapStateToProps = (state: RootState, props: ConformanceInfoProps) => {
  const test = state.Conformance.conformanceTests.filter(t => t.test_id === props.test_id);
  return {
    siteTitle: state.Util.site_title,
    orchestrator: {
      name: state.Util.name || 'N/A'
    },
    admin: state.Auth.access?.admin || false,
    test: test.length === 1 ? test[0] : undefined
  };
};

const mapDispatchToProps = (dispatch: Dispatch) => ({
  getConformanceTest: (testId: string) => dispatch(Conformance.getConformanceTest(testId))
});

const connector = connect(mapStateToProps, mapDispatchToProps);
type ConnectorProps = ConnectedProps<typeof connector>;
type ConformanceInfoConnectedProps = ConformanceInfoProps & ConnectorProps;

// Component
const StatusColors: Record<Conformance.TestStatus, string> = {
  success: 'success',
  unexpected_success: 'info',
  error: 'danger',
  failure: 'warning',
  expected_failure: 'success',
  skipped: 'light'
};

const StatsOrder: Array<Conformance.TestStatus> = [
  'success',
  'unexpected_success',
  'error',
  'failure',
  'expected_failure'
];

const ConformanceInfo: FunctionComponent<ConformanceInfoConnectedProps> = props => {
  const { getConformanceTest, test, test_id } = props;

  if (test) {
    if (test.test_id !== test_id) {
      getConformanceTest(test_id);
    }
  }

  const testResults = (results: Conformance.TestResults) => {
    const { stats, ...profiles } = results;

    const statCounts = Object.entries(stats).map(([profile, profileStats]) => (
      <div key={ profile } className="mb-2">
        <p className="m-0"><strong>{ profile }</strong></p>
        <ListGroup>
          {StatsOrder.map(stat => {
            const v = safeGet(profileStats, stat) || 0;
            if (v > 0) {
              return (
                <ListGroupItem key={ stat } color={ StatusColors[stat] } className="d-flex justify-content-between align-items-center">
                  { titleCase(stat.replace(/_/g, ' ')) }
                  <Badge pill>{ v }</Badge>
                </ListGroupItem>
              );
            }
            return '';
          })}
          <ListGroupItem color="info" className="d-flex justify-content-between align-items-center">
            Total&nbsp;
            <Badge pill>{ profileStats.total }</Badge>
          </ListGroupItem>
        </ListGroup>
      </div>
    ));

    const testResults = Object.entries(profiles).map(([profile, results]) => {
      const tests = StatsOrder.map(stat => {
        return Object.entries(results[stat]).map(([name, rslt]) => {
          const testName = titleCase(name.slice(name.indexOf('_')).replace(/_/g, ' '));
          return (
            <ListGroupItem key={ name } color={ StatusColors[stat] }>
              <p className="mb-1">{ testName }</p>
              { rslt ? <p className="mb-1 text-secondary">{ rslt }</p> : '' }
            </ListGroupItem>
          );
        });
      });
      return (
        <div key={ profile } className="mb-2">
          <p className="m-0"><strong>{ profile }</strong></p>
          <ListGroup>
            { tests }
          </ListGroup>
        </div>
      );
    });

    return (
      <div className="row border border-light">
        <p className="m-0 col-12"><strong>Tests Results:</strong></p>
        <div className='col-md-6'>
          { statCounts }
        </div>
        <div className='col-md-6'>
          <p className="m-0"><strong>Profiles:</strong></p>
          { testResults }
        </div>
      </div>
    );
  };

  if (test_id === undefined) {
    return (
      <Redirect to='/conformance' />
    );
  }

  if (test === undefined) {
    return (
      <p>Test has no results</p>
    );
  }

  const { actuator_tested, test_time, test_results } = test;
  let act = <span />;
  if (actuator_tested) {
    act = (
      <p>
        <strong>Tested Actuator:</strong>
        &nbsp;
        { actuator_tested.name }
        &nbsp;
        { `(${actuator_tested.profile})` }
      </p>
    );
  }
  return (
    <div className="col-md-10 mx-auto jumbotron">
      <h2>Test Info</h2>
      <p>
        <strong>Test ID:</strong>
        &nbsp;
        { test_id }
      </p>
      { act }
      <p>
        <strong>Tested Time:</strong>
        &nbsp;
        { iso2local(test_time) }
      </p>
      { testResults(test_results) }
    </div>
  );
};

export default connector(ConformanceInfo);
