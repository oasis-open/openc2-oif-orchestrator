import React, { Component } from 'react';
import { Dispatch } from 'redux';
import { ConnectedProps, connect } from 'react-redux';
import classNames from 'classnames';
import { toast } from 'react-toastify';
import {
  Button, ButtonGroup, ListGroup, ListGroupItem, ListGroupItemHeading, ListGroupItemText,
  Nav, NavItem, NavLink, TabContent, TabPane, UncontrolledTooltip
} from 'reactstrap';
import { safeGet, titleCase } from '../../utils';
import { Actuator, Conformance, Device } from '../../../actions';
import { RootState } from '../../../reducers';


// Interfaces
interface ConformanceTestProps {}

interface TestType {
  profiles: Array<string>;
  custom: Record<string, any>;
}

interface ConformanceTestState {
  actuator: string;
  custom_tab:  string;
  test_type: string;
  tests: TestType
}

// Redux Connector
const mapStateToProps = (state: RootState) => ({
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
  unittests: state.Conformance.unitTests
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
  getActuators: (page?: number, count?: number, sort?: string) => dispatch(Actuator.getActuators({page, count, sort})),
  getDevices: (page?: number, count?: number, sort?: string) => dispatch(Device.getDevices({page, count, sort})),
  getDevice: (dev_id: string) => dispatch(Device.getDevice(dev_id)),
  getUnittests: () => dispatch(Conformance.getUnittests()),
  runUnittest: (act: string, tests: Conformance.Tests) => dispatch(Conformance.runUnittest(act, tests))
});

const connector = connect(mapStateToProps, mapDispatchToProps);
type ConnectorProps = ConnectedProps<typeof connector>;
type ConformanceTestConnectedProps = ConformanceTestProps & ConnectorProps;

// Component
class ConformanceTest extends Component<ConformanceTestConnectedProps, ConformanceTestState> {
  constructor(props: ConformanceTestConnectedProps) {
    super(props);
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

    const {
      actuators, devices, getActuators, getDevices, getUnittests, unittests
    } = this.props;
    if (devices.loaded === 0) {
      getDevices();
    }
    if (actuators.loaded === 0) {
      getActuators();
    }
    if (Object.keys(unittests).length === 0) {
      getUnittests();
    }
  }

  getContents() {
    const { test_type } = this.state;
    switch (test_type) {
      case 'profile':
        return this.profileTest();
      case 'custom':
        return this.customTest();
      default:
        return <h4 className="col-12">No test type selected</h4>;
    }
  }

  toggleTab(tab: string) {
    this.setState({
      custom_tab: tab
    });
  }

  selectChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const { options, selectedIndex, value } = e.target;
    const field = options[selectedIndex].getAttribute('data-field') as 'test_type' | 'custom';
    const testState: Partial<TestType> = {};

    if (field === 'test_type') {
      if (value === 'profile') {
        testState.custom = {};
      } else if (value === 'custom') {
        testState.profiles = [];
      }
    }

    this.setState(prevState => ({
      ...{
        [field]: value
      },
      tests: {
        ...prevState.tests,
        ...testState
      }
    }));
  }

  updateProfile(e: React.MouseEvent<HTMLElement, MouseEvent>) {
    const val = e.target.value;
    this.setState(prevState => {
      const p = prevState.tests.profiles;
      if (p.includes(val)) {
        p.splice(p.indexOf(val), 1);
      } else {
        p.push(val);
      }

      return {
        tests: {
          custom: {},
          profiles: p
        }
      };
    });
  }

  updateCustom(e: React.ChangeEvent<HTMLInputElement>) {
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
      };
    });
  }

  clearTest() {
    this.setState({
      actuator: '',
      tests: {
        'profiles': [],
        'custom': {}
      }
    });
  }

  runTest() {
    const { actuator, tests, test_type } = this.state;
    if (actuator === '') {
      toast(
        <div>
          <p>Error:</p>
          <p>Actuator not set</p>
        </div>,
        { type: toast.TYPE.WARNING }
      );
      return;
    }
    if (test_type === '') {
        toast(
          <div>
            <p>Error:</p>
            <p>Test type not set</p>
          </div>,
          { type: toast.TYPE.WARNING }
        );
        return;
    }

    let selected_tests = {};
    if (test_type === 'profile') {
      selected_tests = tests.profiles.map(p => ({[p]: []}));
      selected_tests = selected_tests.reduce((o, i) => ({...o, ...i}), {});

    } else if (test_type === 'custom') {
      selected_tests = selected_tests.custom;
    }

    if (Object.keys(selected_tests).length === 0) {
      toast(
        <div>
          <p>Error:</p>
          <p>No tests selected</p>
        </div>,
        { type: toast.TYPE.WARNING }
      );
      return;
    }
    const { runUnittest } = this.props;
    runUnittest(actuator, tests);
    toast(
      <div>
        <p>Info:</p>
        <p>Test Submitted</p>
      </div>,
      { type: toast.TYPE.INFO }
    );
  }

  profileTest() {
    const { unittests } = this.props;
    const { tests } = this.state;
    return (
      <ListGroup className="col-lg-4 col-md-6 col-12">
        { Object.keys(unittests).map(unit => {
          const { profile, doc } = unittests[unit];
          const profileEsc = profile.replace(/[.\s]/g, '_');
          return (
            <ListGroupItem
              key={ unit }
              id={ `${profileEsc}-tooltip` }
              tag='button'
              action
              active={ tests.profiles.includes(unit) }
              onClick={ this.updateProfile }
              value={ unit }
            >
              { profile }
              { doc ? <UncontrolledTooltip placement="bottom" target={ `${profileEsc}-tooltip` }>{ doc }</UncontrolledTooltip> : '' }
            </ListGroupItem>
          );
        })}
      </ListGroup>
    );
  }

  customTest() {
    const { unittests } = this.props;
    const { custom_tab } = this.state;
    const tabs: Array<JSX.Element> = [];
    const contents: Array<JSX.Element> = [];

    Object.keys(unittests).forEach(unit => {
      const { profile, doc, tests } = unittests[unit];
      tabs.push(
        <NavItem key={ unit }>
          <NavLink id={ `${unit}-tooltip` } className={ this.state.custom_tab === profile ? 'active' : '' } onClick={ () => this.toggleTab(profile) }>{ profile }</NavLink>
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
                <ListGroupItem key={ t } className={ classNames({ 'list-group-item-dark': i%2===0 }) } >
                  <ListGroupItemHeading>
                    <label className="m-0">
                      <input type="checkbox" value={ `${unit}.${t}` } onChange={ this.updateCustom } checked={ safeGet(tests.custom, unit, []).includes(t) } />
                      &nbsp;
                      { testName }
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
        <TabContent activeTab={ custom_tab }>
          { contents }
        </TabContent>
      </div>
    );
  }

  render() {
    const { actuators, devices, getDevice } = this.props;
    const { actuator, test_type } = this.state;
    const actuatorOptions = actuators.actuators.map(act => {
      const devs = devices.devices.filter(d => d.device_id === act.device);
      const dev = devs.length === 1 ? devs[0] : undefined;
      if (dev === undefined) { getDevice(act.device); }
      return (
        <option key={ act.actuator_id } value={ act.actuator_id } data-field="actuator" >{ `${dev ? `${dev.name} - ` : ''}${act.name}` }</option>
      );
    });

    return (
      <div>
        <div className="row pr-0 pl-1">
          <label htmlFor="actuator" className="col-2">Test Actuator</label>
          <div className="col-10">
            <select id="actuator" name="actuator" className="form-control" defaultValue="empty" value={ actuator } onChange={ this.selectChange }>
              <option value="empty">Actuator</option>
              { actuatorOptions }
            </select>
          </div>
        </div>

        <hr />

        <div className="row pr-0 pl-1">
          <label htmlFor="test_type" className="col-2">Test Type</label>
          <div className="col-10">
            <select id="test_type" name="test_type" className="form-control" defaultValue="" value={ test_type } onChange={ this.selectChange }>
              <option value="" data-field="test_type">Test Type</option>
              <option value="profile" data-field="test_type">Profile Test</option>
              <option value="custom" data-field="test_type">Custom Test</option>
            </select>
          </div>

          <div className="col-md-12 mt-2 py-2 border border-light">
            <h4>
              { titleCase(test_type) }
              &nbsp;
              Test
            </h4>
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

export default connector(ConformanceTest);
