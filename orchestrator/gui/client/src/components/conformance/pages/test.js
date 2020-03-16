import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Redirect } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  Badge,
  Button,
  ButtonGroup,
  ListGroup,
  ListGroupItem,
  ListGroupItemHeading,
  ListGroupItemText,
  Nav,
  NavItem,
  NavLink,
  TabContent,
  TabPane,
  UncontrolledTooltip
} from 'reactstrap';

import { iso2local, safeGet, titleCase } from '../../utils';
import * as ActuatorActions from '../../../actions/actuator';;
import * as ConformanceActions from '../../../actions/conformance';
import * as DeviceActions from '../../../actions/device'

class ConformanceTest extends Component {
  constructor(props, context) {
    super(props, context);
    this.clearTest = this.clearTest.bind(this);
    this.runTest = this.runTest.bind(this);
    this.selectChange = this.selectChange.bind(this);
    this.updateCustom = this.updateCustom.bind(this);
    this.updateProfile = this.updateProfile.bind(this);

    this.state = {
      actuator: '',
      custom_tab: 'General',
      test_type: '',
      tests: {
        'profiles': [],
        'custom': {}
      }
    };

    if (this.props.devices.loaded === 0) {
      this.props.getDevices();
    }
    if (this.props.actuators.loaded === 0) {
      this.props.getActuators();
    }
    if (Object.keys(this.props.unittests).length === 0) {
      this.props.getUnittests();
    }
  }

  toggleTab(tab) {
    this.setState({
      custom_tab: tab
    });
  }

  selectChange(e) {
    const val = e.target.value;
    const idx = e.nativeEvent.target.selectedIndex;
    const field = e.nativeEvent.target[idx].getAttribute('field');
    const testState = {};

    if (field === 'test_type') {
      if (val === 'profile') {
        testState['custom'] = {};
      } else if (val === 'custom') {
        testState['profiles'] = [];
      }
    }

    this.setState(prevState => ({
      [field]: val,
      tests: {
        ...prevState.tests,
        ...testState
      }
    }));
  }

  updateProfile(e) {
    const val = e.target.value;
    this.setState(prevState => {
      const p = prevState.tests.profiles;
      if (p.includes(val)) {
        p.splice(p.indexOf(val), 1)
      } else {
        p.push(val)
      }

      return {
        tests: {
          custom: {},
          profiles: p
        }
      };
    });
  }

  updateCustom(e) {
    const val = e.target.value.split('.', 2);

    this.setState(prevState => {
      const c = prevState.tests.custom;
      if (val[0] in c) {
        if (c[val[0]].includes(val[1])) {
          c[val[0]].splice(c[val[0]].indexOf(val[1]), 1);
        } else {
          c[val[0]].push(val[1]);
        }
      } else {
        c[val[0]] = [val[1]];
      }

      return {
        tests: {
          custom: c,
          profiles: []
        }
      }
    });

  }

  clearTest() {
    this.setState({
      actuator: '',
      tests: {
        'profiles': [],
        'custom': {}
      }
    })
  }

  runTest() {
    if (this.state.actuator === '') {
      toast(<div><p>Error:</p><p>Actuator not set</p></div>, {type: toast.TYPE.WARNING});
      return;
    }
    if (this.state.test_type === '') {
        toast(<div><p>Error:</p><p>Test type not set</p></div>, {type: toast.TYPE.WARNING});
        return;
    }
    let tests = {};
    if (this.state.test_type === 'profile') {
      tests = this.state.tests.profiles.map(p => ({[p]: []}));
      tests = tests.reduce((o, i) => Object.assign(o, i), {});

    } else if (this.state.test_type === 'custom') {
      tests = this.state.tests.custom;
    }

    if (Object.keys(tests).length === 0) {
        toast(<div><p>Error:</p><p>No tests selected</p></div>, {type: toast.TYPE.WARNING});
        return;
    }
    this.props.runUnittest(this.state.actuator, tests);
    toast(<div><p>Info:</p><p>Test Submitted</p></div>, {type: toast.TYPE.INFO});
  }

  profileTest() {
    return (
      <ListGroup className="col-lg-4 col-md-6 col-12">
        { Object.keys(this.props.unittests).map(unit => {
          const { profile, doc } = this.props.unittests[unit]
          return (
            <ListGroupItem
              key={ unit }
              id={ `${profile}-tooltip` }
              tag="button"
              action
              active={ this.state.tests.profiles.includes(unit) }
              onClick={ this.updateProfile }
              value={ unit }
            >
              { profile }
              { doc ? <UncontrolledTooltip placement="bottom" target={ `${profile}-tooltip` }>{ doc }</UncontrolledTooltip> : '' }
            </ListGroupItem>
          );
        })}
      </ListGroup>
    );
  }

  customTest() {
    const tabs = [];
    const contents = [];

    Object.keys(this.props.unittests).forEach(unit => {
      const { profile, doc, tests } = this.props.unittests[unit];
      tabs.push(
        <NavItem key={ unit }>
          <NavLink id={ `${unit}-tooltip` } className={ this.state.custom_tab === profile ? 'active' : '' } onClick={() => this.toggleTab(profile) }>{ profile }</NavLink>
          { doc ? <UncontrolledTooltip placement="top" target={ `${unit}-tooltip` }>{ doc }</UncontrolledTooltip> : '' }
        </NavItem>
      );

      contents.push(
        <TabPane key={ unit } tabId={ profile } >
          <ListGroup>
            { Object.keys(tests).map((t, i) => {
              const testName = titleCase(t.slice(t.indexOf('_')).replace(/_/g, ' '));
              const v = tests[t];
              return (
                <ListGroupItem key={ t } className={ i%2===0 ? '' : 'list-group-item-dark'}>
                  <ListGroupItemHeading>
                    <label className="m-0">
                      <input type="checkbox" value={ `${unit}.${t}` } onChange={ this.updateCustom } checked={ safeGet(this.state.tests.custom, unit, []).includes(t) } />&nbsp;{ testName }
                    </label>
                  </ListGroupItemHeading>
                  { v ? <ListGroupItemText className="mb-2">{ v }</ListGroupItemText> : '' }
                </ListGroupItem>
              );
            })}
          </ListGroup>
        </TabPane>
      );
    });

    return (
      <div>
        <Nav tabs>
          { tabs }
        </Nav>
        <TabContent activeTab={ this.state.custom_tab }>
          { contents }
        </TabContent>
      </div>
    );
  }

  getContents() {
    switch (this.state.test_type) {
      case "profile":
        return this.profileTest();
        break;
      case "custom":
        return this.customTest();
      default:
        return <h4 className="col-12">No test type selected</h4>;
    }
  }

  render() {
    const actuatorOptions = this.props.actuators.actuators.map(act => {
      let dev = this.props.devices.devices.filter(d => d.device_id === act.device);
      dev = dev.length === 1 ? dev[0] : null;
      if (dev === null) { this.props.getDevice(act.device); }
      return (
        <option key={ act.actuator_id } value={ act.actuator_id } field="actuator" >{ dev ? `${dev.name} - ` : '' }{ act.name }</option>
      );
    });

    return (
      <div>
        <div className="row pr-0 pl-1">
          <label htmlFor="actuator" className="col-2">Test Actuator</label>
          <div className="col-10">
            <select id="actuator" name="actuator" className="form-control" default="empty" value={ this.state.actuator } onChange={ this.selectChange }>
              <option value="empty">Actuator</option>
              { actuatorOptions }
            </select>
          </div>
        </div>

        <hr />

        <div className="row pr-0 pl-1">
          <label htmlFor="test_type" className="col-2">Test Type</label>
          <div className="col-10">
            <select id="test_type" name="test_type" className="form-control" default="" value={ this.state.test_type } onChange={ this.selectChange }>
              <option value="" field="test_type">Test Type</option>
              <option value="profile" field="test_type">Profile Test</option>
              <option value="custom" field="test_type">Custom Test</option>
            </select>
          </div>

          <div className="col-md-12 mt-2 py-2 border border-light">
            <h4>{ titleCase(this.state.test_type) } Test</h4>
            { this.getContents() }
          </div>
        </div>

        <hr />

        <ButtonGroup className="float-right">
          <Button color="warning" onClick={ this.clearTest }>Clear</Button>
          <Button color="primary" onClick={ this.runTest }>Run Test</Button>
        </ButtonGroup>
      </div>
    );
  }
}

ConformanceTest.propTypes = {
  actuators: PropTypes.exact({
    actuators: PropTypes.array,
    loaded: PropTypes.number,
    total: PropTypes.number
  }).isRequired,
  devices: PropTypes.exact({
    devices: PropTypes.array,
    loaded: PropTypes.number,
    total: PropTypes.number
  }).isRequired,
  getActuators: PropTypes.func.isRequired,
  getDevices: PropTypes.func.isRequired,
  getDevice: PropTypes.func.isRequired,
  getUnittests: PropTypes.func.isRequired,
  runUnittest: PropTypes.func.isRequired,
  unittests: PropTypes.object.isRequired
};

const mapStateToProps = state => ({
  actuators: {
    actuators: state.Actuator.actuators,
    loaded: state.Actuator.actuators.length,
    total: state.Actuator.count
  },
  devices: {
    devices: state.Device.devices,
    loaded: state.Device.devices.length,
    total: state.Device.count
  },
  unittests: state.Conformance.unitTests || {}
});

const mapDispatchToProps = dispatch => ({
  getActuators: (page, sizePerPage, sort) => dispatch(ActuatorActions.getActuators(page, sizePerPage, sort)),
  getDevices: (page, sizePerPage, sort) => dispatch(DeviceActions.getDevices(page, sizePerPage, sort)),
  getDevice: (dev_id) => dispatch(DeviceActions.getDevice(dev_id)),
  getUnittests: () => dispatch(ConformanceActions.getUnittests()),
  runUnittest: (act, tests) => dispatch(ConformanceActions.runUnittest(act, tests))
});

export default connect(mapStateToProps, mapDispatchToProps)(ConformanceTest);
