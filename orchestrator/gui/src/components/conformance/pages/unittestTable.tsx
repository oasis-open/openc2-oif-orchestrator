import React, { Component } from 'react';
import { Dispatch } from 'redux';
import { ConnectedProps, connect } from 'react-redux';
import classNames from 'classnames';
import {
  ListGroup, ListGroupItem, ListGroupItemHeading, ListGroupItemText, Nav, NavItem,
  NavLink, TabContent, TabPane, UncontrolledTooltip
} from 'reactstrap';
import { objectValues, titleCase } from '../../utils';
import { Conformance } from '../../../actions';
import { RootState } from '../../../reducers';

// Interfaces
interface UnittestTableProps {}

interface UnittestTableState {
  active_tab: string
}

// Redux Connector
const mapStateToProps = (state: RootState) => ({
  unittests: state.Conformance.unitTests
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
  getUnittests: () => dispatch(Conformance.getUnittests())
});

const connector = connect(mapStateToProps, mapDispatchToProps);
type ConnectorProps = ConnectedProps<typeof connector>;
type UnittestTableConnectedProps = UnittestTableProps & ConnectorProps;

// Component
class UnittestTable extends Component<UnittestTableConnectedProps, UnittestTableState> {
  constructor(props: UnittestTableConnectedProps) {
    super(props);

    this.state = {
      active_tab: ''
    };

    const { getUnittests } = this.props;
    getUnittests();
  }

  shouldComponentUpdate(nextProps: UnittestTableConnectedProps, nextState: UnittestTableState) {
    const propsUpdate = this.props !== nextProps;
    const stateUpdate = this.state !== nextState;

    if (nextState.active_tab === '') {
      const profiles = objectValues(nextProps.unittests).map(t => t.profile);
      const active_tab = profiles.length >= 1 ? profiles[0] : '';
      nextState.active_tab = active_tab;
      return true;
    }

    return propsUpdate || stateUpdate;
  }

  toggleTab(tab: string) {
    this.setState({
      active_tab: tab
    });
  }

  render() {
    const { unittests } = this.props;
    const { active_tab } = this.state;
    const tabs: Array<JSX.Element> = [];
    const contents: Array<JSX.Element> = [];

    Object.keys(unittests).forEach(c => {
      const { profile, doc, tests } = unittests[c];
      const profile_esc = profile.replace(/[.\s]/g, '_');
      tabs.push(
        <NavItem key={ c }>
          <NavLink id={ `${profile_esc}-tooltip` } className={ classNames({ 'active': active_tab === profile }) } onClick={ () => this.toggleTab(profile) }>{ profile }</NavLink>
          { doc ? <UncontrolledTooltip placement="top" target={ `${profile_esc}-tooltip` }>{ doc }</UncontrolledTooltip> : '' }
        </NavItem>
      );

      contents.push(
        <TabPane key={ c } tabId={ profile } >
          <ListGroup>
            { Object.keys(tests).map((t, i) => {
              const testName = titleCase(t.slice(t.indexOf('_')).replace(/_/g, ' '));
              const v = tests[t];
              return (
                <ListGroupItem key={ t } className={ classNames({ 'list-group-item-dark': i%2===0 }) }>
                  <ListGroupItemHeading>{ testName }</ListGroupItemHeading>
                  { v ? <ListGroupItemText>{ v }</ListGroupItemText> : '' }
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
        <TabContent activeTab={ active_tab }>
          { contents }
        </TabContent>
      </div>
    );
  }
}

export default connector(UnittestTable);
