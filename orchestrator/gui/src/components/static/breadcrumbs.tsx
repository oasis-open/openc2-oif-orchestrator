import React, { FunctionComponent } from 'react';
import { ConnectedProps, connect } from 'react-redux';
import { History } from 'history';
import { Breadcrumb, BreadcrumbItem } from 'reactstrap';
import { safeGet } from '../utils';
import * as AuthActions from '../../actions/auth';
import { RootState } from '../../reducers';

// Interfaces
interface BreadcrumbsProp {
  history: History;
  navigate?: (path: History.Path) => void
}

// Redux Connector
const mapStateToProps = (state: RootState) => ({
  history: state.router,
  isAuthenticated: AuthActions.isAuthenticated(state.Auth)
});

const connector = connect(mapStateToProps, {});
type ConnectorProps = ConnectedProps<typeof connector>;
type BreadcrumbsConnectedProps = BreadcrumbsProp & ConnectorProps;

// Component
const DefaultProps = {
  navigate: () => {}
};

const Breadcrumbs: FunctionComponent<BreadcrumbsConnectedProps> = (props) =>  {
    const { history, isAuthenticated, navigate } = props;
    const { pathname } = history.location;
    const crumbs = pathname.replace(/|\/$/g, '').split('/').filter(s => s);

  const navigateCrumbs = (e: React.MouseEvent<HTMLElement, MouseEvent>) => {
    e.preventDefault();
    const href: string | null = safeGet(e.target as Record<string, any>, 'href', null);
    if (href === null || href === undefined ) return;

    if (navigate) {
      navigate(href.replace(window.location.origin, ''));
    }
  };

  if (isAuthenticated) {
    const crumbItems = crumbs.map((crumb, i) => {
      if (crumb === '') { return ''; }
      const active = i === crumbs.length-1;
      const crumbURL = crumbs.slice(0, i+1).join('/');

      return (
        <BreadcrumbItem
          key={ crumb }
          tag={ active ? 'span' : 'a' }
          href={ crumbURL.charAt(0) === '/' ? crumbURL : `/${crumbURL}` }
          onClick={ active ? undefined : navigateCrumbs }
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
          onClick={ home ? undefined : navigateCrumbs }
          active={ home }
        >
          Home
        </BreadcrumbItem>
        { crumbItems }
      </Breadcrumb>
    );
  }
  return (<div />);
};

Breadcrumbs.defaultProps = DefaultProps;

export default connector(Breadcrumbs);
