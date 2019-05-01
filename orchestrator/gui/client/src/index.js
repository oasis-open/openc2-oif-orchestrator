import React from 'react'
import ReactDOM from 'react-dom'

import { Provider } from 'react-redux'
import registerServiceWorker from './registerServiceWorker'

console.log('App State: ' + process.env.NODE_ENV)

// Styles
import { ThemeSwitcher } from './components/utils'
import 'bootstrap'
import 'react-toastify/dist/ReactToastify.css'
// import './components/dependencies/css/themes/lumen.css'
import './components/dependencies/css/styles.less'

import App from './app'

// Config
import createHistory from 'history/createBrowserHistory'
import configureStore from './store'

const history = createHistory()
const store = configureStore(history)

// Theme Options
const validThemes = ['cyborg', 'darkly', 'lumen', 'slate', 'solar', 'superhero']

const Root = () => (
    <Provider store={ store } >
        <ThemeSwitcher storeThemeKey="theme" defaultTheme="lumen" themeOptions={ validThemes }>
            <App history={ history } />
        </ThemeSwitcher>
    </Provider>
)

ReactDOM.render(<Root />, document.getElementById('root'));

registerServiceWorker();
