import React, { FunctionComponent } from 'react';
import classNames from 'classnames';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { IconProp } from '@fortawesome/fontawesome-svg-core';
import { DropdownItem, NavItem, NavLink } from 'reactstrap';

// Interfaces
interface NavElmProps {
  active: string;
  href: string;
  click?: (e: React.MouseEvent<HTMLElement, MouseEvent>) => void;
  dropdown?: boolean;
  external?: boolean;
  icon?: IconProp;
  itemClasses?: string;
  linkClasses?: string;
  target?: '_blank' | '_self' | '_parent' | '_top';
  text?: string;
}

const DefaultProps = {
  // active: '',
  // href: '#',
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  click: (_e: React.MouseEvent<HTMLElement, MouseEvent>) => {},
  dropdown: false,
  external: false,
  icon: undefined,
  itemClasses: '',
  linkClasses: '',
  target: '_self',
  text: ''
};

// Component
const NavElm: FunctionComponent<NavElmProps> = (props) => {
  const {
    active, click, dropdown, external, href, icon, itemClasses, linkClasses, target, text
  } = props;
  const classSet = new Set<string>(itemClasses.split(' '));

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const itemClick: (e: React.MouseEvent<HTMLElement, MouseEvent>) => void = external ? _e => {} : click;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const linkClick: (e: React.MouseEvent<HTMLElement, MouseEvent>) => void = external ? _e => {} : e => { e.preventDefault(); };
  const linkHref = (href || '').endsWith('/') ? href : `${href}/`;
  if (linkHref === active) {
    classSet.add('active');
  }

  if (dropdown) {
    return (
      <DropdownItem className={ linkClasses } href={ linkHref } target={ target } onClick={ itemClick } >
        { icon ? <FontAwesomeIcon icon={ icon } size='lg' /> : '' }
        { icon ? ' ' : '' }
        { text }
      </DropdownItem>
    );
  }

  return (
    <NavItem className={ classNames( ...classSet ) } onClick={ itemClick } >
      <NavLink className={ linkClasses } href={ linkHref } target={ target } onClick={ linkClick } >
        { icon ? <FontAwesomeIcon icon={ icon } size='lg' /> : '' }
        { icon ? ' ' : '' }
        { text }
      </NavLink>
    </NavItem>
  );
};

NavElm.defaultProps = DefaultProps;

export default NavElm;
