import React from 'react';
import PropTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  DropdownItem, NavItem, NavLink
} from 'reactstrap';

const NavElm = props => {
  const {
    active, click, dropdown, external, href, icon, itemClasses, linkClasses, target, text
  } = props;

  const classSet = new Set(itemClasses.split(' '));

  const itemClick = external ? () => {} : click;
  const linkClick = external ? () => {} : e => { e.preventDefault(); };
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
    <NavItem className={ [ ...classSet ].join(' ') } onClick={ itemClick } >
      <NavLink className={ linkClasses } href={ linkHref } target={ target } onClick={ linkClick } >
        { icon ? <FontAwesomeIcon icon={ icon } size='lg' /> : '' }
        { icon ? ' ' : '' }
        { text }
      </NavLink>
    </NavItem>
  );
};

NavElm.propTypes = {
  active: PropTypes.string,
  click: PropTypes.func,
  dropdown: PropTypes.bool,
  external: PropTypes.bool,
  href: PropTypes.string,
  icon: PropTypes.elementType,
  itemClasses: PropTypes.string,
  linkClasses: PropTypes.string,
  target: PropTypes.oneOf(['_blank', '_self', '_parent', '_top', '']),
  text: PropTypes.string
};

NavElm.defaultProps = {
  active: '',
  click: null,
  dropdown: false,
  external: false,
  href: '#',
  icon: null,
  itemClasses: '',
  linkClasses: '',
  target: '_self',
  text: ''
};

export default NavElm;
