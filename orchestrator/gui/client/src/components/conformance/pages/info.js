import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Redirect } from 'react-router-dom';
import {
  Badge,
  ListGroup,
  ListGroupItem
} from 'reactstrap';

import { iso2local, safeGet, titleCase } from '../../utils';
import * as ActuatorActions from '../../../actions/actuator';
import * as ConformanceActions from '../../../actions/conformance';
import * as DeviceActions from '../../../actions/device';

class ConformanceInfo extends Component {
  constructor(props, context) {
    super(props, context);

    this.color = {
      success: 'success',
      unexpected_success: 'info',
      error: 'danger',
      failure: 'warning',
      expected_failure: 'success',
      skipped: 'light'
    };

    this.statsOrder = [
      'success',
      'unexpected_success',
      'error',
      'failure',
      'expected_failure'
    ];

    if (this.props.test) {
      if (this.props.test.test_id !== this.props.test_id) {
        this.props.getConformanceTest(this.props.test_id);
      }
    }
  }

  test_results(results) {
    const { stats={}, ...profiles } = results;

    const statCounts = Object.entries(stats).map(([p, s]) => (
      <div key={ p } className="mb-2">
        <p className="m-0"><strong>{ p }</strong></p>
        <ListGroup>
          {this.statsOrder.map(stat => {
            const v = safeGet(s, stat, 0);
            if (v > 0) {
              return (
                <ListGroupItem key={ stat } color={ this.color[stat] } className="d-flex justify-content-between align-items-center">
                  { titleCase(stat.replace(/_/g, ' ')) }
                  <Badge pill>{ v }</Badge>
                </ListGroupItem>
              );
            }
            return '';
          })}
          <ListGroupItem color="info" className="d-flex justify-content-between align-items-center">Total <Badge pill>{ s.total }</Badge></ListGroupItem>
        </ListGroup>
      </div>
    ));

    const testResults = Object.entries(profiles).map(([p, r]) => {
      const tests = Object.entries(r).map(([s, t]) => {
        return Object.entries(t).map(([k, v]) => {
          const testName = titleCase(k.slice(k.indexOf('_')).replace(/_/g, ' '));
          return (
            <ListGroupItem key={ k } color={ this.color[s] }>
              <p className="mb-1">{ testName }</p>
              { v ? <p className="mb-1 text-secondary">{ v }</p> : '' }
            </ListGroupItem>
          );
        });
      });
      return (
        <div key={ p } className="mb-2">
          <p className="m-0"><strong>{ p }</strong></p>
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
  }

  render() {
    if (this.props.test_id === undefined) {
      return (
        <Redirect to='/conformance' />
      );
    }

    const { test_id, actuator_tested={}, test_time, test_results } = this.props.test;
    return (
      <div className="col-md-10 mx-auto jumbotron">
        <h2>Test Info</h2>
        <p><strong>Test ID:</strong> { test_id }</p>
        <p><strong>Tested Actuator:</strong> { actuator_tested.name }</p>
        <p><strong>Tested Time:</strong> { iso2local(test_time) }</p>
        { this.test_results(test_results) }
      </div>
    );
  }
}

ConformanceInfo.propTypes = {
  test: PropTypes.shape({
    test_id: PropTypes.string,
    test_time: PropTypes.string,
    tests_run: PropTypes.object,
    test_results: PropTypes.object
  }).isRequired,
  getConformanceTest: PropTypes.func.isRequired,
  test_id: PropTypes.string.isRequired
};

const mapStateToProps = (state, props) => {
  const test = state.Conformance.conformanceTests.filter(t => t.test_id === props.test_id);
  return {
    siteTitle: state.Util.site_title,
    orchestrator: {
      name: state.Util.name || 'N/A'
    },
    admin: state.Auth.access.admin,
    test: test.length === 1 ? test[0] : { test_id: '', test_time: '', tests_run: {}, test_results: {} }
  };
};

const mapDispatchToProps= dispatch => ({
  getConformanceTest: test => dispatch(ConformanceActions.getConformanceTest(test))
});

export default connect(mapStateToProps, mapDispatchToProps)(ConformanceInfo);
