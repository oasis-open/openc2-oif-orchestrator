import React, { Component } from 'react';
import PropTypes from 'prop-types';

const capitalize = s => s.charAt(0).toUpperCase() + s.substring(1);

class ThemeChooser extends Component {
  constructor(props, context) {
    super(props, context);
    this.onSelect = this.onSelect.bind(this);

    const { currentTheme, defaultTheme, themes } = this.context;

    // get themes from context and sort them for display
    this.themes = [ ...themes ];
    this.themes.sort();

    this.state = {
      currentTheme: currentTheme || '',
      defaultTheme
    };
  }

  onSelect(e) {
    e.preventDefault();
    this.setState({
      currentTheme: e.target.getAttribute('data-theme')
    }, () => {
      const { change } = this.props;
      const { currentTheme } = this.state;
      const { themeSwitcher } = this.context;

      // eslint-disable-next-line promise/catch-or-return
      themeSwitcher.load(currentTheme).then(() => {
        return change(currentTheme);
      });
    });
  }

  render() {
    const { size, style } = this.props;
    const { currentTheme, defaultTheme } = this.state;

    const themes = this.themes.map(theme => {
      return (
        <button
          key={ theme }
          type='button'
          className={ `btn btn-info ${theme === currentTheme ? 'active' : ''}` }
          data-theme={ theme }
          onClick={ this.onSelect }
        >
          { `${theme === defaultTheme ? '* ' : ''}${capitalize(theme)}` }
        </button>
      );
    });

    return (
      <div className='dropdown dropdown-menu-right' style={ style }>
        <button
          id='theme-menu'
          type='button'
          className={ `btn btn-default dropdown-toggle ${size === '' ? '' : `btn-${size}` }` }
          data-toggle='dropdown'
          aria-haspopup='true'
          aria-expanded='true'
        >
          Theme
        </button>

        <div className='dropdown-menu p-0'>
          <div className={ `btn-group-vertical${size === '' ? '' : ` btn-group-${size}` } w-100` }>
            { themes }
          </div>
        </div>
      </div>
    );
  }
}

ThemeChooser.contextTypes = {
  defaultTheme: PropTypes.string,
  themeSwitcher: PropTypes.object,
  themes: PropTypes.array,
  currentTheme: PropTypes.string
};

ThemeChooser.propTypes = {
  style: PropTypes.object,
  size: PropTypes.oneOf(['sm', 'lg', '']),
  change: PropTypes.func
};

ThemeChooser.defaultProps = {
  style: {},
  size: '',
  change: () => {}
};

export default ThemeChooser;