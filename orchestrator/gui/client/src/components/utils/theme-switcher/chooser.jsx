import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  Button, ButtonDropdown, ButtonGroup, DropdownMenu, DropdownToggle
} from 'reactstrap';

const capitalize = s => s.charAt(0).toUpperCase() + s.substring(1);

class ThemeChooser extends Component {
  constructor(props, context) {
    super(props, context);
    this.onSelect = this.onSelect.bind(this);
    this.toggleList = this.toggleList.bind(this);

    const { currentTheme, defaultTheme, themes } = this.context;

    // get themes from context and sort them for display
    this.themes = [ ...themes ];
    this.themes.sort();

    this.state = {
      listOpen: false,
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

  toggleList() {
    this.setState(prevState => ({
      listOpen: !prevState.listOpen
    }));
  }

  render() {
    const { size, style } = this.props;
    const { currentTheme, defaultTheme, listOpen } = this.state;

    const themes = this.themes.map(theme => {
      return (
        <Button
          key={ theme }
          color='info'
          active={ theme === currentTheme }
          data-theme={ theme }
          onClick={ this.onSelect }
        >
          { `${theme === defaultTheme ? '* ' : ''}${capitalize(theme)}` }
        </Button>
      );
    });

    return (
      <ButtonDropdown isOpen={ listOpen } toggle={ this.toggleList } style={ style }>
        <DropdownToggle
          caret
          color='default'
          size={ size }
        >
          Theme
        </DropdownToggle>

        <DropdownMenu className='p-0'>
          <ButtonGroup vertical size={ size } className='w-100'>
            { themes }
          </ButtonGroup>
        </DropdownMenu>
      </ButtonDropdown>
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