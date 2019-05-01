const generalConfig = require('./general.config')
const webpack = require('webpack')
const merge = require('webpack-merge')
const path = require('path')

const DeadCodePlugin = require('webpack-deadcode-plugin')

env = 'development'
console.log('NODE_ENV: ' + env)

const ROOT_DIR = path.join(__dirname, '..')
const BUILD_DIR = path.join(ROOT_DIR, 'build')

const config = merge(generalConfig, {
    mode: env,
    devtool: 'eval',
    optimization: {
        usedExports: true,
    },
    plugins: [
        new DeadCodePlugin({
            patterns: [
                'src/**/*.(js|jsx|css)',
            ],
            exclude: [
                '**/*.(stories|spec).(js|jsx)',
            ]
        }),
        new webpack.DefinePlugin({
            'process.env': {
                NODE_ENV: JSON.stringify(env),
            },
        }),
        new webpack.NoEmitOnErrorsPlugin(),
    ]
});


module.exports = config