import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Helmet } from 'react-helmet-async'

import OpenC2_Logo from '../dependencies/img/openc2-logo.png'

const str_fmt = require('string-format')

class Home extends Component {
  constructor(props, context) {
    super(props, context)

    this.meta = {
      title: str_fmt('{base} | {page}', {base: this.props.siteTitle, page: 'Home'}),
      canonical: str_fmt('{origin}{path}', {origin: window.location.origin, path: window.location.pathname})
    }
  }

  render() {
    return (
      <div className="row mx-auto">
        <Helmet>
          <title>{ this.meta.title }</title>
          <link rel="canonical" href={ this.meta.canonical } />
        </Helmet>
        <div className="col-12">
          <img src={ OpenC2_Logo } alt="OpenC2 Logo" className="float-left col-md-4 col-xs-12 mr-3 mb-3" />

          <p>Spicy jalapeno bacon ipsum dolor amet dolore aliquip sirloin swine quis veniam magna in ipsum voluptate reprehenderit elit velit sunt.
            Landjaeger laboris buffalo excepteur bacon commodo fugiat.
            Pastrami landjaeger rump, id dolore corned beef flank ad beef officia velit meatball ex.
            Qui ipsum cupim, dolore adipisicing salami est in ham hock consectetur hamburger enim pork belly.
            Incididunt quis shankle magna, minim occaecat ham officia consectetur landjaeger burgdoggen leberkas pastrami.</p>

          <p>Hamburger pork chop nostrud ea minim dolore, venison flank exercitation sausage pork sirloin.
            Kielbasa frankfurter consequat cupidatat shoulder short loin non eu.
            Doner pig in hamburger, consequat eu veniam prosciutto.
            Pork sint tail biltong tenderloin do nulla in swine tempor strip steak adipisicing incididunt.
            Pastrami in anim ham officia ut excepteur dolor cupim ground round veniam biltong meatball.
            Enim frankfurter swine meatloaf spare ribs capicola.
            Do fatback chicken rump, est id pork chop leberkas shankle shank eu esse.</p>

          <p>Reprehenderit landjaeger kevin ut pork loin.
            Leberkas sirloin deserunt voluptate, veniam andouille quis tenderloin non ground round nisi.
            Cupidatat culpa sausage nisi filet mignon, tempor aliquip sed bresaola qui chicken do in veniam.
            Dolor in tri-tip buffalo ham fugiat, mollit pariatur.
            Nisi ut leberkas labore, shoulder shank cow turducken nostrud non et velit ad veniam.
            Fatback cupidatat pancetta est laborum chuck quis flank ipsum ribeye.</p>
        </div>
      </div>
    )
  }
}

const mapStateToProps = (state) => ({
  siteTitle: state.Util.site_title
})

export default connect(mapStateToProps)(Home)
