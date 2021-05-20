import React, { FunctionComponent } from 'react';
import classNames from 'classnames';
import { IconType } from 'react-icons';
import { DropdownItem, NavItem, NavLink } from 'reactstrap';

// Interfaces
interface NavElmProps {
  active: string;
  href: string;
  click?: (e: React.MouseEvent<HTMLElement, MouseEvent>) => void;
  dropdown?: boolean;
  external?: boolean;
  icon?: IconType;
  itemClasses?: string;
  linkClasses?: string;
  target?: '_blank' | '_self' | '_parent' | '_top';
  text?: string;
}

const DefaultProps = {
  active: '',
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  click: (_e: React.MouseEvent<HTMLElement, MouseEvent>) => {},
  dropdown: false,
  external: false,
  href: '#',
  itemClasses: '',
  linkClasses: '',
  target: '_self',
  text: ''
};
const iconOptions = {
  size: '1.3333333333em',
  style: {
    lineHeight: '0.75em',
    verticalAlign: '-0.225em'
  }
};

// Component
const NavElm: FunctionComponent<NavElmProps> = (props) => {
  const {
    active, click, dropdown, external, href, icon, itemClasses, linkClasses, target, text
  } = { ...DefaultProps, ...props };
  const classSet = new Set<string>(itemClasses.split(' '));
  const Icon = icon;

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
        { Icon ? <Icon { ...iconOptions } /> : '' }
        { Icon ? ' ' : '' }
        { text }
      </DropdownItem>
    );
  }

  return (
    <NavItem className={ classNames( ...classSet ) } onClick={ itemClick } >
      <NavLink className={ linkClasses } href={ linkHref } target={ target } onClick={ linkClick } >
        { Icon ? <Icon { ...iconOptions } /> : '' }
        { Icon ? ' ' : '' }
        { text }
      </NavLink>
    </NavItem>
  );
};

export default NavElm;
