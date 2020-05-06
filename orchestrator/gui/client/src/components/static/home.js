import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Helmet } from 'react-helmet-async';
import {
  Card,
  CardBody,
  CardHeader
} from 'reactstrap';

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

          <p>Leverage agile frameworks to provide a robust synopsis for high level overviews.
          Iterative approaches to corporate strategy foster collaborative thinking to further the overall value proposition.
          Organically grow the holistic world view of disruptive innovation via workplace diversity and empowerment.</p>

          <p>Bring to the table win-win survival strategies to ensure proactive domination.
          At the end of the day, going forward, a new normal that has evolved from generation X is on the runway heading
          towards a streamlined cloud solution. User generated content in real-time will have multiple touchpoints for
          offshoring.</p>

          <p>Capitalize on low hanging fruit to identify a ballpark value added activity to beta test.
          Override the digital divide with additional clickthroughs from DevOps.
          Nanotechnology immersion along the information highway will close the loop on focusing solely on the bottom line.</p>
        </div>

        <div className="col-12 col-md-6">
          <Card>
            <CardHeader>Transports</CardHeader>
            <CardBody>
              <ul>
                <li><a href="#" rel="noopener noreferrer">CoAP</a> - Nonstandard, no specification</li>
                <li><a href="https://docs.oasis-open.org/openc2/open-impl-https/v1.0/open-impl-https-v1.0.html" rel="noopener noreferrer" target="_blank">HTTPS</a> *<sup>Official</sup></li>
                <li><a href="#" rel="noopener noreferrer">MQTT</a> - Nonstandard, no specification</li>
                <li><a href="#" rel="noopener noreferrer">ZMQ</a> - Nonstandard, no specification</li>
              </ul>
            </CardBody>
          </Card>
        </div>

        <div className="col-12 col-md-6">
          <Card>
            <CardHeader>Serializations</CardHeader>
            <CardBody>
              <ul>
                <li><a href="https://github.com/liteserver/binn" rel="noopener noreferrer" target="_blank">Binn</a></li>
                <li><a href="https://wiki.theory.org/index.php/BitTorrentSpecification#Bencoding" rel="noopener noreferrer" target="_blank">Bencode</a></li>
                <li><a href="http://bsonspec.org/" rel="noopener noreferrer" target="_blank">BSON</a></li>
                <li><a href="https://tools.ietf.org/html/rfc7049" rel="noopener noreferrer" target="_blank">CBOR</a></li>
                <li><a href="https://tools.ietf.org/html/rfc8259" rel="noopener noreferrer" target="_blank">JSON</a> *<sup>Official</sup></li>
                <li><a href="https://msgpack.org" rel="noopener noreferrer" target="_blank">MessagePack (msgpack)</a></li>
                <li><a href="https://people.csail.mit.edu/rivest/Sexp.txt" rel="noopener noreferrer" target="_blank">S-expressions</a></li>
                <li><a href="https://github.com/FasterXML/smile-format-specification" rel="noopener noreferrer" target="_blank">Smile</a></li>
                <li><a href="https://github.com/toml-lang/toml" rel="noopener noreferrer" target="_blank">Toml</a></li>
                <li><a href="https://w3.org/TR/2008/REC-xml-20081126/" rel="noopener noreferrer" target="_blank">XML</a></li>
                <li><a href="http://ubjson.org/" rel="noopener noreferrer" target="_blank">ubjson</a></li>
                <li><a href="https://github.com/arangodb/velocypack" rel="noopener noreferrer" target="_blank">VelocityPack (VPack)</a> - Requires velocity pack to be installed, only C++ module available</li>
                <li><a href="https://yaml.org/spec/1.2/spec.html" rel="noopener noreferrer" target="_blank">YAML</a></li>
              </ul>
            </CardBody>
          </Card>
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
