import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { createBrowserHistory } from 'history';
import { Helmet } from 'react-helmet-async';
import { toast } from 'react-toastify';

import { Button } from 'reactstrap';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCog } from '@fortawesome/free-solid-svg-icons';

class Error extends Component {
  constructor(props, context) {
    super(props, context);

    this.goBack = this.goBack.bind(this);

    this.meta = {
      title: `${this.props.siteTitle} | Oops...`,
      canonical: `${window.location.origin}${window.location.pathname}`
    };

    this.iconGeneral = {
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

    this.reverseAnimation = {
      MozAnimationDirection: 'reverse',
      OAnimationDirection: 'reverse',
      WebkitAnimationDirection: 'reverse',
      animationDirection: 'reverse'
    };
  }

  goBack() {
    if (this.props.history.length === 1) {
      toast(<p>Looks like this is a new tab, try closing it instead of going back</p>, {type: toast.TYPE.WARNING});
    } else {
      this.props.history.goBack();
    }
  }

  render() {
    return (
      <div className="jumbotron well col-md-10 col-12 mx-auto">
        <Helmet>
          <title>{ this.meta.title }</title>
          <link rel="canonical" href={ this.meta.canonical } />
        </Helmet>
        <h1>Whoops</h1>
        <h3>This isn&apos;t a valid page, are you sure this is where you wanted to go?</h3>
        <div className='mx-auto' style={{
          height: '9em',
          width: '9em',
          fontSize: '1em',
          position: 'relative'
        }}>
          <FontAwesomeIcon
            icon={ faCog }
            spin
            style={ this.iconGeneral }
          />
          <FontAwesomeIcon
            icon={ faCog }
            spin
            style={{
              ...this.iconGeneral,
              ...this.reverseAnimation,
              fontSize: '6em',
              top: '0.53em',
              left: '0.25em'
            }}
          />
          <FontAwesomeIcon
            icon={ faCog }
            spin
            style={{
              ...this.iconGeneral,
              fontSize: '3em',
              top: '0.25em',
              left: '1.7em'
            }}
          />
        </div>
        <Button color="primary" onClick={ this.goBack }>Go Back</Button>
      </div>
    );
  }
}

Error.propTypes = {
  history: PropTypes.objectOf(createBrowserHistory).isRequired,
  siteTitle: PropTypes.string.isRequired
};

const mapStateToProps = (state) => ({
  siteTitle: state.Util.site_title
});

export default connect(mapStateToProps)(Error);
