import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { HelmetProvider } from 'react-helmet-async';
import { ThemeSwitcher } from 'react-bootswatch-theme-switcher';
// import registerServiceWorker from './registerServiceWorker';

// Styles
// import 'bootstrap';
import 'react-toastify/dist/ReactToastify.css';
import './components/dependencies/css/ribbon.scss';
import './components/dependencies/css/styles.scss';

// Orchestrator Application
import App from './app';

// Config
import configureStore, { history } from './store';

const store = configureStore(history);

// Theme Options  test
const validThemes = ['light', 'dark'];

const Root = () => (
  <ThemeSwitcher storeThemeKey="theme" defaultTheme="light" themeRoot="assets" themeOptions={ validThemes }>
    <Provider store={ store } >
      <HelmetProvider>
        <App history={ history } />
      </HelmetProvider>
    </Provider>
  </ThemeSwitcher>
);

ReactDOM.render(<Root />, document.getElementById('root'));
// registerServiceWorker();
