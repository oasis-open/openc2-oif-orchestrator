import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import {
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

import { objectValues, titleCase } from '../../utils';
import * as ConformanceActions from '../../../actions/conformance';

class UnittestTable extends Component {
  constructor(props, context) {
    super(props, context);

    this.state = {
      active_tab: ''
    };

    this.props.getUnittests();
  }

  shouldComponentUpdate(nextProps, nextState) {
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

  toggleTab(tab) {
    this.setState({
      active_tab: tab
    });
  }

  render() {
    const tabs = [];
    const contents = [];

    Object.keys(this.props.unittests).forEach(c => {
      const { profile, doc, tests } = this.props.unittests[c];
      const profile_esc = profile.replace(/[.\s]/g, '_');
      tabs.push(
        <NavItem key={ c }>
          <NavLink id={ `${profile_esc}-tooltip` } className={ this.state.active_tab === profile ? 'active' : '' } onClick={() => this.toggleTab(profile) }>{ profile }</NavLink>
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
                <ListGroupItem key={ t } className={ i%2===0 ? '' : 'list-group-item-dark'}>
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
        <TabContent activeTab={ this.state.active_tab }>
          { contents }
        </TabContent>
      </div>
    );
  }
}

UnittestTable.propTypes = {
  getUnittests: PropTypes.func.isRequired,
  unittests: PropTypes.object.isRequired
};

const mapStateToProps = state => ({
  unittests: state.Conformance.unitTests
});

const mapDispatchToProps = dispatch => ({
  getUnittests: () => dispatch(ConformanceActions.getUnittests())
});

export default connect(mapStateToProps, mapDispatchToProps)(UnittestTable);
