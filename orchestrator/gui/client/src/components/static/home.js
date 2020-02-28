import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Helmet } from 'react-helmet-async';

import LogoOpenC2 from '../dependencies/img/openc2-logo.png';

class Home extends Component {
  constructor(props, context) {
    super(props, context);

    this.meta = {
      title: `${this.props.siteTitle} | Home`,
      canonical: `${window.location.origin}${window.location.pathname}`
    };
  }

  render() {
    return (
      <div className="row mx-auto">
        <Helmet>
          <title>{ this.meta.title }</title>
          <link rel="canonical" href={ this.meta.canonical } />
        </Helmet>
        <div className="col-12">
          <img src={ LogoOpenC2 } alt="OpenC2 Logo" className="float-left col-md-4 col-xs-12 mr-3 mb-3" />

          <p>Spicy jalapeno bacon ipsum dolor amet dolore aliquip sirloin swine quis veniam magna in ipsum&nbsp;
          voluptate reprehenderit elit velit sunt. Landjaeger laboris buffalo excepteur bacon commodo fugiat.&nbsp;
          Pastrami landjaeger rump, id dolore corned beef flank ad beef officia velit meatball ex. Qui ipsum&nbsp;
          cupim, dolore adipisicing salami est in ham hock consectetur hamburger enim pork belly. Incididunt quis&nbsp;
          shankle magna, minim occaecat ham officia consectetur landjaeger burgdoggen leberkas pastrami.</p>

          <p>Hamburger pork chop nostrud ea minim dolore, venison flank exercitation sausage pork sirloin.&nbsp;
          Kielbasa frankfurter consequat cupidatat shoulder short loin non eu. Doner pig in hamburger, consequat&nbsp;
          eu veniam prosciutto. Pork sint tail biltong tenderloin do nulla in swine tempor strip steak&nbsp;
          adipisicing incididunt. Pastrami in anim ham officia ut excepteur dolor cupim ground round veniam&nbsp;
          biltong meatball. Enim frankfurter swine meatloaf spare ribs capicola. Do fatback chicken rump, est id&nbsp;
          pork chop leberkas shankle shank eu esse.</p>

          <p>Reprehenderit landjaeger kevin ut pork loin. Leberkas sirloin deserunt voluptate, veniam andouille&nbsp;
          quis tenderloin non ground round nisi. Cupidatat culpa sausage nisi filet mignon, tempor aliquip sed&nbsp;
          bresaola qui chicken do in veniam. Dolor in tri-tip buffalo ham fugiat, mollit pariatur. Nisi ut&nbsp;
          leberkas labore, shoulder shank cow turducken nostrud non et velit ad veniam. Fatback cupidatat&nbsp;
          pancetta est laborum chuck quis flank ipsum ribeye.</p>
        </div>
      </div>
    );
  }
}

Home.propTypes = {
  siteTitle: PropTypes.string.isRequired
};

const mapStateToProps = state => ({
  siteTitle: state.Util.site_title
});

export default connect(mapStateToProps)(Home);
