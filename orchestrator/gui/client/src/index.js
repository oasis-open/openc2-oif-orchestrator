import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { HelmetProvider } from 'react-helmet-async';
import { createBrowserHistory } from 'history';

import registerServiceWorker from './registerServiceWorker';

// Styles
import { ThemeSwitcher } from './components/utils';
import 'bootstrap';
import 'react-toastify/dist/ReactToastify.css';
import './components/dependencies/css/styles.less';

// Orchestrator Application
import App from './app';

// Config
import configureStore from './store';

const history = createBrowserHistory();
const store = configureStore(history);

// Theme Options
const validThemes = ['cyborg', 'darkly', 'flatly', 'litera', 'lumen', 'slate', 'spacelab', 'yeti'];

const Root = () => (
  <Provider store={ store } >
    <HelmetProvider>
      <ThemeSwitcher storeThemeKey="theme" defaultTheme="lumen" themeOptions={ validThemes }>
        <App history={ history } />
      </ThemeSwitcher>
    </HelmetProvider>
  </Provider>
);

ReactDOM.render(<Root />, document.getElementById('root'));
registerServiceWorker();
