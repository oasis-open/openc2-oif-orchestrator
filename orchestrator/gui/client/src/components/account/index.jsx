import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Helmet } from 'react-helmet-async';
import { createBrowserHistory } from 'history';

import ChangePassword from './change_password';

class Account extends Component {
  constructor(props, context) {
    super(props, context);

    const { match, siteTitle } = this.props;
    this.meta = {
      title: `${siteTitle} | Account`,
      canonical: `${window.location.origin}${window.location.pathname}`
    };

    this.validPages = ['all', 'change_password'];
    let page = match.params.page || 'all';

    if (!this.validPages.includes(page)) {
      page = 'all';
    }

    this.state = {
      activeTab: page
    };
  }

  toggleTab(tab) {
    const { activeTab } = this.state;
    if (activeTab !== tab) {
      const { history } = this.props;
      history.push({
        pathname: `/account/${tab}`
      });
      this.setState({
        activeTab: tab
      });
    }
  }

  render() {
    const { activeTab } = this.state;
    let page = null;
    switch (activeTab) {
      case 'change_password':
        page = <ChangePassword />;
        break;
      default:
        page = (
          <div className="row mx-auto">
            <h1>Account Options</h1>
            <p>Todo</p>
          </div>
        );
    }

    return (
      <div >
        <Helmet>
          <title>{ this.meta.title }</title>
          <link rel="canonical" href={ this.meta.canonical } />
        </Helmet>
        { page }
      </div>
    );
  }
}

Account.propTypes = {
  history: PropTypes.objectOf(createBrowserHistory).isRequired,
  match: PropTypes.object.isRequired,
  siteTitle: PropTypes.string.isRequired
};

const mapStateToProps = (state) => ({
  siteTitle: state.Util.site_title
});

export default connect(mapStateToProps)(Account);
