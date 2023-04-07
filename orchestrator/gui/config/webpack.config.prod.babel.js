import webpack from 'webpack';
import { merge } from 'webpack-merge';
import path from 'path';

import CopyWebpackPlugin from 'copy-webpack-plugin';
import FaviconsWebpackPlugin from 'favicons-webpack-plugin';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import OptimizeCSSAssetsPlugin from 'optimize-css-assets-webpack-plugin';
import TerserPlugin from 'terser-webpack-plugin';
import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer';
import { CleanWebpackPlugin } from 'clean-webpack-plugin';

import baseConfig from './webpack.config.base';
import Loaders from './webpack.loaders';

const NODE_ENV = 'production';

const ROOT_DIR = path.join(__dirname, '..');
const BUILD_DIR = path.join(ROOT_DIR, 'build');
const COMPONENTS_DIR = path.join(ROOT_DIR, 'src', 'components');
const DEPEND_DIR = path.join(COMPONENTS_DIR, 'dependencies');

export default merge(baseConfig, {
  mode: NODE_ENV,
  devtool: 'source-map',
  plugins: [
    new webpack.DefinePlugin({
      NODE_ENV
    }),
    new BundleAnalyzerPlugin({
      analyzerMode: 'static',
      generateStatsFile: true,
      openAnalyzer: false,
      statsFilename: path.join(ROOT_DIR, 'analyzer.stats.json'),
      reportFilename: path.join(ROOT_DIR, 'analyzer.stats.html')
    }),
    new MiniCssExtractPlugin({
      filename: 'css/[name].bundle.min.css',
      chunkFilename: 'css/[name].bundle.min.css'
    }),
    new CopyWebpackPlugin({
      patterns: [
        { // Theme Assets
          from: path.resolve('node_modules', 'react-bootswatch-theme-switcher', 'assets'),
          to: path.join(BUILD_DIR, 'assets'),
          toType: 'dir'
        }
      ]
    }),
    new CleanWebpackPlugin({
      dry: false
    })
  ],
  optimization: {
    minimizer: [
      new TerserPlugin({
        extractComments: false,
        parallel: true
      }),
      new OptimizeCSSAssetsPlugin({
        cssProcessorPluginOptions: {
          preset: [
            'default',
            {
              discardComments: {
                removeAll: true
              }
            }
          ]
        },
        canPrint: true
      })
    ]
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [
          MiniCssExtractPlugin.loader,
          Loaders.css
        ]
      },
      {
        test: /\.s[ac]ss$/,
        use: [
          MiniCssExtractPlugin.loader,
          Loaders.css,
          'sass-loader'
        ]
      }
    ]
  }
});
