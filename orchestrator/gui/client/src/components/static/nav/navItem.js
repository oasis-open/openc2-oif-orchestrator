import React from 'react';
import PropTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  DropdownItem,
  NavItem,
  NavLink
} from 'reactstrap';

const NavElm = props => {
  const external = props.external || false;
  const itemClasses = new Set(props.itemClasses.split(' '));

  const itemClick = external ? () => {} : props.click;
  const linkClick = external ? () => {} : e => { e.preventDefault(); };
  const href = (props.href || '').endsWith('/') ? props.href : `${props.href}/`;
  if (props.href === props.active) {
    itemClasses.add('active');
  }

  if (props.dropdown) {
    return (
      <DropdownItem className={ props.linkClasses } href={ href } target={ props.target } onClick={ itemClick } >
        { props.icon ? <FontAwesomeIcon icon={ props.icon } size='lg' /> : '' }
        { props.icon ? ' ' : '' }
        { props.text }
      </DropdownItem>
    );
  }

  return (
    <NavItem className={ [ ...itemClasses ].join(' ') } onClick={ itemClick } >
      <NavLink className={ props.linkClasses } href={ href } target={ props.target } onClick={ linkClick } >
        { props.icon ? <FontAwesomeIcon icon={ props.icon } size='lg' /> : '' }
        { props.icon ? ' ' : '' }
        { props.text }
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
