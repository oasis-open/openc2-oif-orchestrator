import React, { Component } from 'react';
import { ConnectedProps, connect } from 'react-redux';
import { History } from 'history';
import { Helmet } from 'react-helmet-async';

import ChangePassword from './change_password';
import { RootState } from '../../reducers';

// Interfaces
type Page = 'all' | 'change_password';
interface AccountProps {
  history: History;
  match: {
    params: {
      option?: string;
      page?: Page;
    }
  };
}

interface AccountState {
  activeTab: string;
}

// Redux Connector
const mapStateToProps = (state: RootState) => ({
  siteTitle: state.Util.site_title
});

const connector = connect(mapStateToProps, {});
type ConnectorProps = ConnectedProps<typeof connector>;
type AccountConnectedProps = AccountProps & ConnectorProps;

// Component
class Account extends Component<AccountConnectedProps, AccountState> {
  validPages = ['all', 'change_password'];
  meta: {
    title: string;
    canonical: string;
  };

  constructor(props: AccountConnectedProps) {
    super(props);

    const { match, siteTitle } = this.props;
    this.meta = {
      title: `${siteTitle} | Account`,
      canonical: `${window.location.origin}${window.location.pathname}`
    };

    let page = match.params.page || 'all';

    if (!this.validPages.includes(page)) {
      page = 'all';
    }

    this.state = {
      activeTab: page
    };
  }

  toggleTab(tab: string) {
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

export default connector(Account);
