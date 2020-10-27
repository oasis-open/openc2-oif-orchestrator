import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { createBrowserHistory } from 'history';
import { Helmet } from 'react-helmet-async';
import { toast } from 'react-toastify';

import { Button } from 'reactstrap';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCog } from '@fortawesome/free-solid-svg-icons';

const gearBoxStyles = {
  height: '9em',
  width: '9em',
  fontSize: '1em',
  position: 'relative'
};

const iconGeneral = {
  display: 'inline-block',
  width: '1em',
  height: '1em',
  fontSize: '4em',
  textAlign: 'center',
  position: 'absolute',
  top: 0,
  left: 0,
  MozAnimationDuration: '5s',
  OAnimationDuration: '5s',
  WebkitAnimationDuration: '5s',
  animationDuration: '5s'
};

const reverseAnimation = {
  MozAnimationDirection: 'reverse',
  OAnimationDirection: 'reverse',
  WebkitAnimationDirection: 'reverse',
  animationDirection: 'reverse'
};

const gears = [
  iconGeneral,
  {
    ...iconGeneral,
    ...reverseAnimation,
    fontSize: '6em',
    top: '0.53em',
    left: '0.25em'
  },
  {
    ...iconGeneral,
    fontSize: '3em',
    top: '0.25em',
    left: '1.7em'
  }
];

const Error = props =>  {
  const { siteTitle } = props;

  const meta = {
    title: `${siteTitle} | Oops...`,
    canonical: `${window.location.origin}${window.location.pathname}`
  };

  const goBack = () => {
    const { history } = props;
    if (history.length === 1) {
      toast(
        <p>Looks like this is a new tab, try closing it instead of going back</p>,
        { type: toast.TYPE.WARNING }
      );
    } else {
      history.goBack();
    }
  };

  const gearIcons = gears.map((styles, idx) => {
    // eslint-disable-next-line react/no-array-index-key
    return <FontAwesomeIcon key={ idx } icon={ faCog } spin style={ styles } />;
  });

  return (
    <div className="jumbotron well col-md-10 col-12 mx-auto">
      <Helmet>
        <title>{ meta.title }</title>
        <link rel="canonical" href={ meta.canonical } />
      </Helmet>
      <h1>Whoops</h1>
      <h3>This isn&apos;t a valid page, are you sure this is where you wanted to go?</h3>
      <div className='mx-auto' style={ gearBoxStyles }>
        { gearIcons }
      </div>
      <Button color="primary" onClick={ goBack }>Go Back</Button>
    </div>
  );
};

Error.propTypes = {
  history: PropTypes.objectOf(createBrowserHistory).isRequired,
  siteTitle: PropTypes.string.isRequired
};

const mapStateToProps = (state) => ({
  siteTitle: state.Util.site_title
});

export default connect(mapStateToProps)(Error);
