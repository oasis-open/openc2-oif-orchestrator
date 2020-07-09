import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Helmet } from 'react-helmet-async';
import validThemes from './themes';
import './assets/css/loader.css';

import * as themeActions from './theme-actions';

const setItem = (key, obj) => {
  if (!key) return;
  try {
    localStorage.setItem(key, JSON.stringify(obj));
  } catch (err) {
    // TODO: something...
  }
};

const getItem = key => {
  if (!key) return null;
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  } catch (err) {
    return null;
  }
};

//------------------------------------------------------------------------------
// Top level ThemeSwitcher Component
//------------------------------------------------------------------------------
class ThemeSwitcher extends Component {
  constructor(props, context) {
    super(props, context);
    this.load = this.load.bind(this);
    this.loadTheme = this.loadTheme.bind(this);

    const {
      defaultTheme, storeThemeKey, themes, themeOptions
    } = this.props;

    const validThemeOptions = new Set(themeOptions.filter(t => validThemes.includes(t)));

    let defTheme = getItem(storeThemeKey);
    defTheme = defTheme || defaultTheme;
    validThemeOptions.add(defTheme);

    this.state = {
      currentTheme: defTheme,
      themes: themes || {},
      themeOptions: validThemeOptions
    };

    this.loadTheme(defTheme);
    setTimeout(() => {
      validThemeOptions.forEach(theme => this.loadTheme(theme));
    }, 100);
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    return {
      ...prevState,
      themes: {
        ...prevState.themes,
        ...nextProps.loadedThemes
      }
    };
  }

  // pass reference to this down to ThemeChooser component
  getChildContext() {
    const { defaultTheme, themeOptions } = this.props;
    const { currentTheme } = this.state;

    return {
      defaultTheme,
      themeSwitcher: this,
      themes: [ ...themeOptions ],
      currentTheme
    };
  }

  getContents() {
    const { themes } = this.state;

    if (Object.keys(themes).length === 0) {
      return (
        <div
          style={{
            display: 'table',
            position: 'fixed',
            top: 0,
            height: '100%',
            width: '100%'
          }}
        >
          <div
            style={{
              display: 'table-cell',
              textAlign: 'center',
              verticalAlign: 'middle'
            }}
          >
            <div className="loader" />
            <p className='pt-0 mt-0'>Loading...</p>
          </div>
        </div>
      );
    }
    const { children } = this.props;
    return children || <span />;
  }

  async loadTheme(theme) {
    const { loadTheme } = this.props;
    const { themes, themeOptions } = this.state;

    if (!themeOptions.has(theme)) { return; }

    if (!(theme in themes)) {
      loadTheme(theme);
    }
  }

  async load(theme) {
    const { defaultTheme, storeThemeKey } = this.props;
    const { themes, themeOptions } = this.state;

    if (!theme) {
      const storedTheme = getItem(storeThemeKey);
      // see if a theme was previously stored, will return null if storedThemeKey not set
      // eslint-disable-next-line no-param-reassign
      theme = storedTheme || defaultTheme;
    }

    if (!themeOptions.has(theme)) { return; }

    setItem(storeThemeKey, theme);
    this.setState({
      currentTheme: theme
    });

    if (!Object.keys(themes).includes(theme)) {
      this.loadTheme(theme);
    }
  }

  render() {
    const { currentTheme, themes } = this.state;

    return (
      <div>
        <Helmet>
          <style type="text/css" data-type="theme">
            { themes[currentTheme] || '' }
          </style>
        </Helmet>
        { this.getContents() }
      </div>
    );
  }
}

ThemeSwitcher.childContextTypes = {
  defaultTheme: PropTypes.string,
  themeSwitcher: PropTypes.instanceOf(ThemeSwitcher),
  themes: PropTypes.array,
  currentTheme: PropTypes.string
};

ThemeSwitcher.propTypes = {
  defaultTheme: PropTypes.string,
  storeThemeKey: PropTypes.string,
  themes: PropTypes.object,
  themeOptions: PropTypes.array,
  children: PropTypes.element,
  // State/Action props
  loadTheme: PropTypes.func.isRequired,
  loadedThemes: PropTypes.object.isRequired
};

ThemeSwitcher.defaultProps = {
  defaultTheme: 'lumen',
  storeThemeKey: null,
  themes: null,
  themeOptions: validThemes,
  children: null
};

const mapStateToProps = (state, props) => ({
  loadedThemes: { ...(props.themes || {}), ...state.theme }
});

const mapDispatchToProps = dispatch => ({
  loadTheme: theme => dispatch(themeActions.loadTheme(theme))
});

export default connect(mapStateToProps, mapDispatchToProps)(ThemeSwitcher);
