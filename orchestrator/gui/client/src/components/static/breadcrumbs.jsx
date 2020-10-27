import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { createBrowserHistory } from 'history';
import { Breadcrumb, BreadcrumbItem } from 'reactstrap';

import * as AuthActions from '../../actions/auth';

class Breadcrumbs extends Component {
  constructor(props, context) {
    super(props, context);
    this.navigate = this.navigate.bind(this);

    const { history } = this.props;

    this.pathname = history.location.pathname;
    this.crumbs = this.pathname.replace(/|\/$/g, '').split('/').filter(s => s);
  }

  shouldComponentUpdate(nextProps) {
    const { pathname } = nextProps.history.location;
    if (pathname === this.pathname) return false;
    this.pathname = pathname;
    this.crumbs = this.pathname.replace(/^\/|\/$/g, '').split('/');
    return true;
  }

  navigate(e) {
    e.preventDefault();
    const { navigate } = this.props;
    if (e.target.href === null || e.target.href === undefined ) return;
    const href = e.target.href.replace(window.location.origin, '');

    navigate({
      pathname: href
    });
  }

  render() {
    const { isAuthenticated } = this.props;

    if (isAuthenticated) {
      const crumbs = this.crumbs.map((crumb, i) => {
        if (crumb === '') { return ''; }
        const active = i === this.crumbs.length-1;
        const crumbURL = this.crumbs.slice(0, i+1).join('/');

        return (
          <BreadcrumbItem
            key={ crumb }
            tag={ active ? 'span' : 'a' }
            href={ crumbURL.charAt(0) === '/' ? crumbURL : `/${crumbURL}` }
            onClick={ active ? null : this.navigate }
            active={ active }
          >
            { crumb.split(/[\s_]/g).map(w => w[0].toUpperCase() + w.substr(1).toLowerCase()).join(' ') }
          </BreadcrumbItem>
        );
      }).filter(b => b);
      const home = crumbs.length === 0;

      return (
        <Breadcrumb tag="nav" listTag="div">
          <BreadcrumbItem
            tag={ home ? 'span' : 'a' }
            href="/"
            onClick={ home ? null : this.navigate }
            active={ home }
          >
            Home
          </BreadcrumbItem>
          { crumbs }
        </Breadcrumb>
      );
    }
    return (<div />);
  }
}

Breadcrumbs.propTypes = {
  history: PropTypes.objectOf(createBrowserHistory).isRequired,
  isAuthenticated: PropTypes.bool.isRequired,
  navigate: PropTypes.func
};

Breadcrumbs.defaultProps = {
  navigate: null
};

const mapStateToProps = (state) => ({
  history: state.Router || state.router,
  isAuthenticated: AuthActions.isAuthenticated(state.Auth)
});

export default connect(mapStateToProps)(Breadcrumbs);
