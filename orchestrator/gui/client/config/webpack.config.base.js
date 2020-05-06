/**
 * Base webpack config used across other specific configs
 */
import webpack from 'webpack';
import merge from 'webpack-merge';
import path from 'path';

import HtmlWebpackPlugin from 'html-webpack-plugin';
import Loaders from './webpack.loaders';

const NODE_ENV = 'production';
const ROOT_DIR = path.join(__dirname, '..');
const BUILD_DIR = path.join(ROOT_DIR, 'build');
const COMPONENTS_DIR = path.join(ROOT_DIR, 'src', 'components');
const DEPEND_DIR = path.join(COMPONENTS_DIR, 'dependencies');

export default {
  devtool: 'inline-source-map',
  entry: {
    main: path.join(ROOT_DIR, 'src', 'index.js'),
    account: path.join(COMPONENTS_DIR, 'account', 'index.js'),
    device: path.join(COMPONENTS_DIR, 'device', 'index.js'),
    actuator: path.join(COMPONENTS_DIR, 'actuator', 'index.js'),
    command: path.join(COMPONENTS_DIR, 'command', 'index.js')
  },
  output: {
    path: BUILD_DIR,
    publicPath: '/',
    filename: 'js/[name].bundle.min.js'
  },
  context: ROOT_DIR,
  resolve: {
    extensions: ['.js', '.jsx', '.json', '.ts', '.tsx'],
    modules: ['node_modules', path.join(ROOT_DIR, 'src')]
  },
  plugins: [
    new webpack.EnvironmentPlugin({
      NODE_ENV
    }),
    new webpack.NamedModulesPlugin(),
    new HtmlWebpackPlugin({
      filename: 'index.html',
      template: path.join(DEPEND_DIR, 'index.html')
    })
  ],
  optimization: {
    mergeDuplicateChunks: true,
    runtimeChunk: false,
    splitChunks: {
      automaticNameDelimiter: '_',
      cacheGroups: {
        vendors: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all'
        },
        utils: {
          test: /components\/utils[\\/]/,
          name: 'utils',
          chunks: 'all'
        }
      }
    }
  },
  target: 'web',
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            cacheDirectory: true
          }
        }
      },
      {
        test: /\.(c|le)ss$/,
        use: [
          'style-loader',
          Loaders.css,
          Loaders.less
        ]
      },
      {  // WOFF Font
        test: /\.woff(\?v=\d+\.\d+\.\d+)?$/,
        use: merge.smart(Loaders.url, {
          options: {
            mimetype: 'application/font-woff'
          }
        })
      },
      {  // WOFF2 Font
        test: /\.woff2(\?v=\d+\.\d+\.\d+)?$/,
        use: merge.smart(Loaders.url, {
          options: {
            mimetype: 'application/font-woff'
          }
        })
      },
      {  // TTF Font
        test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/,
        use: merge.smart(Loaders.url, {
          options: {
            mimetype: 'application/octet-stream'
          }
        })
      },
      {  // EOT Font
        test: /\.eot(\?v=\d+\.\d+\.\d+)?$/,
        use: 'file-loader'
      },
      {
        test: /\.svg(\?v=\d+\.\d+\.\d+)?$/,
        loader: 'svg-url-loader',
        options: {
          limit: 10 * 1024,
          noquotes: true,
          fallback: Loaders.file
        }
      },
      {  // Common Image Formats
        test: /\.(?:bmp|ico|gif|png|jpe?g|tiff|webp)$/,
        use: Loaders.url
      }
    ]
  }
};
