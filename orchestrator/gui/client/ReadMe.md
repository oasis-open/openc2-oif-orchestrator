# OASIS TC Open: oif-orchestrator-gui

## Server
### About this Image
- Work in progress Not available as of yet

### How to use this image
- Work in progress Not available as of yet

## GUI
### About this Image
- This image is Alpine 3.10 with a simple GUI for use with the GUI Server
- UI port - 80

### How to use this image
Note: Pulling an images requires using a specific tag (server or gui), the latest tag is not supported.

- Prior to the GUI starting, the Core should be started and running.
- Container Env Args:
	- `ORC_HOST` - Hostname/IP address of the system running the Core	- `ORC_PORT` - Port the Core runs one (Docker port not mapped port)

- Adding Certs 
	1. Create a directory in httpd named `conf`
	2. TODO...

Environment Variables

| Variable | Type | Description | Default|
| ----------- | ----------- | ----------- | ----------- |
| ORC_HOST | String | Hostname/IP address of the system running the Orchestrator Core | None |
| ORC_PORT | Integer | Port the Orchestrator Core is running the API on | None |

### Resources
- General
	- [Another JSON Validator](https://www.npmjs.com/package/ajv) - JSON schema validator
	- [Bootstrap](https://getbootstrap.com/)
	    - [Bootstrap](https://www.npmjs.com/package/bootstrap) - Bootstrap for node
	    - [jQuery](https://www.npmjs.com/package/jquery) - jQuery for node
	    - [Reactstrap](https://www.npmjs.com/package/reactstrap) - Bootstrap v4 components for React
	- [Django Channels](https://www.npmjs.com/package/django-channels) - WebSocket support for Django Channels
   	- [FontAwesome](https://fontawesome.com/) - Additional Icons
	    - [Core SVG Icons](https://www.npmjs.com/package/@fortawesome/fontawesome-svg-core)
	    - [Solid SVG Icons](https://www.npmjs.com/package/@fortawesome/free-solid-svg-icons)
	    - [React FontAwesome](https://www.npmjs.com/package/@fortawesome/react-fontawesome)
	- [History](https://www.npmjs.com/package/history) - History management for single page apps
	- [JWT Decode](https://www.npmjs.com/package/jwt-decode) - JSON Web Tokens
	- [Moment](https://www.npmjs.com/package/moment) - DateTime formatting/parsing
	- [Query String](https://www.npmjs.com/package/query-string) - Parse and stringify URL query strings
	- [React](https://reactjs.org/) - Core Framework
    	- [Bootstrap Tables](https://www.npmjs.com/package/react-bootstrap-table-next/)
    	- [Bootstrap Tables Paginator](https://www.npmjs.com/package/react-bootstrap-table2-paginator)
    	- [Confirm Alert](https://www.npmjs.com/package/react-confirm-alert) - Confirmation popup
		- [Connected React Router](https://www.npmjs.com/package/connected-react-router) - Router State Sync, replacement for react-router-redux
		- [DOM](https://www.npmjs.com/package/react-dom)
    	- [Helmet](https://www.npmjs.com/package/react-helmet) - Dynamic page metadata
    	- [JSON Editor](https://www.npmjs.com/package/react-json-editor-ajrm) - JSON Syntax Editor
    	- [JSON Pretty](https://www.npmjs.com/package/react-json-pretty) - JSON Pretty Format
    	- [Moment](https://www.npmjs.com/package/react-moment) - Date/Time Formatting
		- [Redux](https://www.npmjs.com/package/react-redux) - React Redux Bindings
		- [Router DOM](https://www.npmjs.com/package/react-router-dom)
		- [Scripts](https://www.npmjs.com/package/react-scripts)
		- [Toastify](https://www.npmjs.com/package/react-toastify) - Notifications
    	- [Transition Group](https://www.npmjs.com/package/react-transition-group)
    - [Redux](https://redux.js.org/) - State container
    	- [API Middleware](https://www.npmjs.com/package/redux-api-middleware)
    	- [Logger](https://www.npmjs.com/package/redux-logger)
		- [Persist](https://www.npmjs.com/package/redux-persist)
		- [Persist Transform Filter](https://www.npmjs.com/package/redux-persist-transform-filter)
	- [String Format](https://www.npmjs.com/package/string-format)
	- [vkBeautify](https://www.npmjs.com/package/vkbeautify) - JSON, XML, CSS, SQL pretty/minify
	- [Warning](https://www.npmjs.com/package/warning)

- Developement
	- [CSSO](https://www.npmjs.com/package/csso) - CSS Optimizer
	- [fs-extra](https://www.npmjs.com/package/fs-extra) - File system methods
	- [File Download](https://www.npmjs.com/package/download-file) - File Downloads
	- [Named Regex Groups](https://www.npmjs.com/package/named-regexp-groups) - Named group extraction
	- [Strinct URI Encode](https://www.npmjs.com/package/strict-uri-encode)
	- [Sync Requests](https://www.npmjs.com/package/sync-requests) - Synchronous HTTP requests
	- [WebPack](https://www.npmjs.com/package/webpack) - Module bundler and builder
		- [Bundle Tracker](https://www.npmjs.com/package/webpack-bundle-tracker)
		- [CLI](https://www.npmjs.com/package/webpack-cli)
		- [Dev Server](https://www.npmjs.com/package/webpack-dev-server)
		- [HTTP Proxy Middleware](https://www.npmjs.com/package/http-proxy-middleware)
		- [Loaders](https://webpack.js.org/loaders) - Loader Info
			- [Babel](https://www.npmjs.com/package/babel-loader)
				- [Babel Core](https://www.npmjs.com/package/@babel/core)
				- [Proposal Object Rest Spread](https://www.npmjs.com/package/@babel/plugin-proposal-object-rest-spread)
				- [Preset Env](https://www.npmjs.com/package/@babel/preset-env)
				- [Preset React](https://www.npmjs.com/package/@babel/preset-react)
			- [CSS](https://www.npmjs.com/package/css-loader)
			- [File](https://www.npmjs.com/package/file-loader)
			- [Less](https://www.npmjs.com/package/less-loader) - Loads Less to CSS
				- [Less](https://www.npmjs.com/package/less) - Core package
			- [Style](https://www.npmjs.com/package/style-loader)
			- [URL](https://www.npmjs.com/package/url-loader)
		- [Merge](https://www.npmjs.com/package/webpack-merge) - Config Merge
		- [Plugins](https://webpack.js.org/plugins) - Plugin Info
			- [Clean](https://www.npmjs.com/package/clean-webpack-plugin)
			- [Copy](https://www.npmjs.com/package/copy-webpack-plugin)
			- [Deadcode](https://www.npmjs.com/package/webpack-deadcode-plugin) - Find and notify of unused code
			- [Favicons](https://www.npmjs.com/package/favicons-webpack-plugin)
			- [HTML](https://www.npmjs.com/package/html-webpack-plugin)
			- [Mini CSS](https://www.npmjs.com/package/mini-css-extract-plugin)
			- [Optimize CSS Assets](https://www.npmjs.com/package/optimize-css-assets-webpack-plugin)
			- [Terser](https://www.npmjs.com/package/terser-webpack-plugin)

#### Interesting Modules
- [Entity Editor](https://www.npmjs.com/package/react-entity-editor)
- [SpreadSheet Grid](https://www.npmjs.com/package/react-spreadsheet-grid)
- [React Admin](https://github.com/marmelab/react-admin)