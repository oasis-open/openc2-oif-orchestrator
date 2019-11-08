import React, { Component } from 'react'
import { Helmet } from 'react-helmet-async';
import PropTypes from 'prop-types'
import validThemes from './themes'
import './assets/css/loader.css'

import { sleep } from '../'

const setItem = (key, obj) => {
  if (!key) return null;
  try {
    localStorage.setItem(key, JSON.stringify(obj));
  } catch (err) {
    return null;
  }
}

const getItem = (key) => {
  if (!key) return null;
  try {
    let item = localStorage.getItem(key)
    return item ? JSON.parse(item) : null;
  } catch (err) {
    return null;
  }
}

//------------------------------------------------------------------------------
// Top level ThemeSwitcher Component
//------------------------------------------------------------------------------
class ThemeSwitcher extends Component {
  constructor(props, context) {
    super(props, context);
    this.load = this.load.bind(this);
    this.loadTheme = this.loadTheme.bind(this);

    let validThemes = new Set(this.props.themeOptions)

    let defaultTheme = getItem(this.props.storeThemeKey)
    defaultTheme = defaultTheme ? defaultTheme : this.props.defaultTheme
    validThemes.add(defaultTheme)

    this.state = {
      currentTheme: defaultTheme,
      themes: {},
      validThemes: validThemes
    }

    this.loadTheme(defaultTheme)
    setTimeout(() => {
      for (let theme of validThemes) {
        this.loadTheme(theme)
      }
    }, 100)
  }

  async loadTheme(theme) {
    if (!this.state.validThemes.has(theme)) {
      return
    }

    if (Object.keys(this.state.themes).indexOf(theme) == -1) {
      return await fetch(window.location.origin + "/assets/css/" + theme + ".css")
        .then(rsp => rsp.text())
        .then(data => {
          this.setState(prevState => ({
            themes: {
              ...prevState.themes,
              [theme]: data
            }
          }))
        }).catch(err => {
          console.error(err)
        })
    }
  }

  async load(theme) {
    if (!theme) {
      let storedTheme = getItem(this.props.storeThemeKey)
      // see if a theme was previously stored, will return null if storedThemeKey not set
      theme = storedTheme ? storedTheme : this.props.defaultTheme
    }

    if (!this.state.validThemes.has(theme)) { return }

    setItem(this.props.storeThemeKey, theme)
    this.setState({
      currentTheme: theme
    })
    if (Object.keys(this.state.themes).indexOf(theme) == -1) {
      return await this.loadTheme(theme)
    }
  }

  // pass reference to this down to ThemeChooser component
  getChildContext() {
    return {
      defaultTheme: this.props.defaultTheme,
      themeSwitcher: this,
      themes: [...this.state.validThemes],
      currentTheme: this.state.currentTheme
    }
  }

  getContents() {
    if (Object.keys(this.state.themes).length === 0) {
      return (
        <div style={{
          display: 'table',
          position: 'fixed',
          top: 0,
          height: '100%',
          width: '100%'
        }}>
          <div style={{
            display: 'table-cell',
            textAlign: 'center',
            verticalAlign: 'middle'
          }}>
            <div className="loader" />
            <p className='pt-0 mt-0'>Loading...</p>
          </div>
        </div>
      )
    } else {
      return this.props.children || <span />
    }
  }

  render() {
    return (
      <div>
        <Helmet>
          <style type="text/css" data-type="theme">
            { this.state.themes[this.state.currentTheme] || "" }
          </style>
        </Helmet>
        { this.getContents() }
      </div>
    )
  }
}

ThemeSwitcher.childContextTypes = {
  defaultTheme: PropTypes.string,
  themeSwitcher: PropTypes.object,
  themes: PropTypes.array,
  currentTheme: PropTypes.string
};

ThemeSwitcher.propTypes = {
  defaultTheme: PropTypes.string,
  storeThemeKey: PropTypes.string,
  themes: PropTypes.object,
  themeOptions: PropTypes.array
};

ThemeSwitcher.defaultProps = {
  defaultTheme: 'lumen',
  storeThemeKey: null,
  themes: null,
  themeOptions: ['cerulean', 'cosmo', 'cyborg', 'darkly', 'flatly', 'journal', 'litera', 'lumen', 'lux', 'materia', 'minty', 'pulse', 'sandstone', 'simplex', 'sketchy', 'slate', 'solar', 'spacelab', 'superhero', 'united', 'yeti']
};

export default ThemeSwitcher;