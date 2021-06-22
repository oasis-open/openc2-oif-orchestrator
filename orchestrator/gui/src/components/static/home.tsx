import React, { FunctionComponent } from 'react';
import { ConnectedProps, connect } from 'react-redux';
import { Helmet } from 'react-helmet-async';
import { Card, CardBody, CardHeader } from 'reactstrap';
import LogoOpenC2 from '../dependencies/img/openc2-logo.png';
import { RootState } from '../../reducers';

// Interfaces
// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface HomeProps {}

// Redux Connector
const mapStateToProps = (state: RootState) => ({
  siteTitle: state.Util.site_title
});

const connector = connect(mapStateToProps, {});
type ConnectorProps = ConnectedProps<typeof connector>;
type HomeConnectedProps = HomeProps & ConnectorProps;

// Component
const Home: FunctionComponent<HomeConnectedProps> = (props) => {
  const { siteTitle } = props;

  const meta = {
    title: `${siteTitle} | Home`,
    canonical: `${window.location.origin}${window.location.pathname}`
  };

  return (
    <div className="mx-auto">
      <Helmet>
        <title>{ meta.title }</title>
        <link rel="canonical" href={ meta.canonical } />
      </Helmet>

      <div className="row">
        <div className="col-lg-4 col-md-6 col-sm-8 col-12 mb-3 mx-auto">
          <img src={ LogoOpenC2 } alt="OpenC2 Logo" className="img-responsive w-100" />
        </div>

        <div className="col-md-10 offset-md-1 col-12 mb-3">
          <Card>
            <CardHeader>Statement of Purpose</CardHeader>
            <CardBody>
              <p>
                OpenC2 Integration Framework (OIF) is a project that will enable developers to create and test OpenC2
                specifications and implementations without having to recreate an entire OpenC2 ecosystem.
              </p>
              <p>
                OIF consists of two major parts. The &quot;orchestrator&quot; which functions as an OpenC2 producer and
                the &quot;Device&quot; which functions as an OpenC2 consumer.
              </p>
              <p>
                This application is the OpenC2 Orchestrator. The Device repository can be found&nbsp;
                <a href="https://github.com/oasis-open/openc2-oif-device" rel="noopener noreferrer" target="_blank">here</a>
                .&nbsp;Due to port bindings it is recommended that the orchestrator and the device not be run on the same
                machine.
              </p>
              <p>
                The OIF Orchestrator was created with the intent of being an easy-to-configure OpenC2 producer that can be
                used in the creation of reference implementations to control multiple devices. To that end it allows for the
                addition of multiple serializations and transportation types.
              </p>
            </CardBody>
          </Card>
        </div>
      </div>

      <div className="row">
        <div className="col-md-5 offset-md-1 col-12">
          <Card>
            <CardHeader>Transports</CardHeader>
            <CardBody>
              <ul>
                { /* <li>CoAP - Nonstandard, no specification</li> */ }
                <li>HTTP - Nonstandard, no specification</li>
                <li>
                  <a href="https://docs.oasis-open.org/openc2/open-impl-https" rel="noopener noreferrer" target="_blank">HTTPS</a>
                  <sup>* Official</sup>
                </li>
                <li>
                  <a href="https://github.com/oasis-tcs/openc2-transf-mqtt" rel="noopener noreferrer" target="_blank">MQTT - In Progress</a>
                </li>
                <li>
                  <a href="https://github.com/oasis-tcs/openc2-transf-odxl" rel="noopener noreferrer" target="_blank">OpenDXL - In Progress</a>
                  <p className="mb-1">- Currently not implemented</p>
                </li>
                {/* <li>ZMQ - Nonstandard, no specification</li> */}
              </ul>
            </CardBody>
          </Card>
        </div>

        <div className="col-md-5 col-12">
          <Card>
            <CardHeader>Serializations</CardHeader>
            <CardBody>
              <ul>
                <li><a href="https://github.com/liteserver/binn" rel="noopener noreferrer" target="_blank">Binn</a></li>
                <li><a href="https://wiki.theory.org/index.php/BitTorrentSpecification#Bencoding" rel="noopener noreferrer" target="_blank">Bencode</a></li>
                <li><a href="http://bsonspec.org/" rel="noopener noreferrer" target="_blank">BSON</a></li>
                <li><a href="https://tools.ietf.org/html/rfc7049" rel="noopener noreferrer" target="_blank">CBOR</a></li>
                <li><a href="https://amzn.github.io/ion-docs" rel="noopener noreferrer" target="_blank">Amazon ION</a></li>
                <li>
                  <a href="https://tools.ietf.org/html/rfc8259" rel="noopener noreferrer" target="_blank">JSON</a>
                  <sup>* Official</sup>
                </li>
                <li><a href="https://msgpack.org" rel="noopener noreferrer" target="_blank">MessagePack (msgpack)</a></li>
                <li><a href="https://people.csail.mit.edu/rivest/Sexp.txt" rel="noopener noreferrer" target="_blank">S-expressions</a></li>
                <li><a href="https://github.com/FasterXML/smile-format-specification" rel="noopener noreferrer" target="_blank">Smile</a></li>
                <li><a href="https://github.com/toml-lang/toml" rel="noopener noreferrer" target="_blank">Toml</a></li>
                <li><a href="https://w3.org/TR/2008/REC-xml-20081126/" rel="noopener noreferrer" target="_blank">XML</a></li>
                <li><a href="http://ubjson.org/" rel="noopener noreferrer" target="_blank">ubjson</a></li>
                <li>
                  <a href="https://github.com/arangodb/velocypack" rel="noopener noreferrer" target="_blank">VelocityPack (VPack)</a>
                  <p className="mb-1">- Requires velocity pack to be installed, only C++ module available</p>
                </li>
                <li><a href="https://yaml.org/spec/1.2/spec.html" rel="noopener noreferrer" target="_blank">YAML</a></li>
              </ul>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default connector(Home);
