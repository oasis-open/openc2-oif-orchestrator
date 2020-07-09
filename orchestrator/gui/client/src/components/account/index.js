import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Helmet } from 'react-helmet-async';
import { createBrowserHistory } from 'history';

import { ChangePassword } from './lib';

class Account extends Component {
  constructor(props, context) {
    super(props, context);

    this.meta = {
      title: `${this.props.siteTitle} | Account`,
      canonical: `${window.location.origin}${window.location.pathname}`
    };

    console.log(this.props.match.params.page);
    this.validPages = ['all', 'change_password'];
    let page = this.props.match.params.page || 'all';

    if (this.validPages.indexOf(page) ===  -1) {
      page = 'all';
    }

    this.state = {
      activeTab: page
    };
  }

  toggleTab(tab) {
    if (this.state.activeTab !== tab) {
      this.props.history.push({
        pathname: `/account/${tab}`
      });
      this.setState({
        activeTab: tab
      });
    }
  }

  render() {
    let page = null;
    switch (this.state.activeTab) {
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
