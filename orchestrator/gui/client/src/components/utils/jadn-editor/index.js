/* eslint-disable jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */
import PropTypes from 'prop-types';
import JSONInput from 'react-json-editor-ajrm';
import { getType } from 'react-json-editor-ajrm/mitsuketa';
import defaultLocale from 'react-json-editor-ajrm/locale/en';

// eslint-disable-next-line camelcase
import { DomNode_Update, JSON_Placeholder } from './tokenize';

class JADNInput extends JSONInput {
  tokenize(obj) {
    const objType = getType(obj);

    if (objType !== 'object') {
      return console.error(`tokenize() expects object type properties only. Got '${objType}' type instead.`);
    }

    const locale = this.props.locale || defaultLocale;

    // DOM Node || OnBlue or Update
    if ('nodeType' in obj) {
      return DomNode_Update(obj, locale, this.colors);
    }

    // JS OBJECTS || PLACEHOLDER
    if (!('nodeType' in obj)) {
      return JSON_Placeholder(obj, this.colors);
    }

    console.log('Oops....');
    return null;
  }
}

JADNInput.propTypes = {
  locale: PropTypes.object.isRequired,
  id: PropTypes.string,
  placeholder: PropTypes.object,
  reset: PropTypes.bool,
  viewOnly: PropTypes.bool,
  onChange: PropTypes.func,
  confirmGood: PropTypes.bool,
  height: PropTypes.string,
  width: PropTypes.string,
  onKeyPressUpdate: PropTypes.bool,
  waitAfterKeyPress: PropTypes.number,
  theme: PropTypes.string,
  colors: PropTypes.shape({
    default: PropTypes.string,
    background: PropTypes.string,
    background_warning: PropTypes.string,
    string: PropTypes.string,
    number: PropTypes.string,
    colon: PropTypes.string,
    keys: PropTypes.string,
    keys_whiteSpace: PropTypes.string,
    primitive: PropTypes.string
  }),
  style: PropTypes.shape({
    outerBox: PropTypes.object,
    container: PropTypes.object,
    warningBox: PropTypes.object,
    errorMessage: PropTypes.object,
    body: PropTypes.object,
    labelColumn: PropTypes.object,
    labels: PropTypes.object,
    contentBox: PropTypes.object
  })
};

JADNInput.defaultProps = {
  id: '',
  placeholder: {},
  reset: false,
  viewOnly: false,
  onChange: () => {},
  confirmGood: true,
  height: '',
  width: '',
  onKeyPressUpdate: true,
  waitAfterKeyPress: 1000,
  theme: 'light_mitsuketa_tribute',
  colors: {},
  style: {}
};

export default JADNInput;
