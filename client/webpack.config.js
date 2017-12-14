const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const DashboardPlugin = require('webpack-dashboard/plugin');

const {NODE_ENV, PUBLIC_PATH} = process.env;

const IS_PROD = NODE_ENV === 'production';

const SRC_DIR = path.resolve('./src/');
const DIST_DIR = path.resolve('./dist/');
const NODE_MODULES_DIR = path.resolve('./node_modules/');

console.log(`IS_PROD: ${IS_PROD}`);
console.log(`PUBLIC_PATH: ${PUBLIC_PATH}`);

const loaders = {};
const plugins = {};

loaders.tslint = {
  test: /\.ts$/,
  enforce: 'pre',
  loader: 'tslint-loader',
  exclude: NODE_MODULES_DIR,
  options: {
    configFile: path.resolve('./tslint.json'),
  },
};

loaders.ts = {
  test: /\.ts$/,
  use: [
    {
      loader: 'awesome-typescript-loader',
      options: {
        useCache: true,
        useBabel: true,
        babelOptions: {
          presets: [
            'env'
          ],
          babelrc: false,
          compact: true,
        },
      },
    },
  ],
  exclude: NODE_MODULES_DIR,
};

loaders.scss = {
  test: /\.scss$/,
  use: ExtractTextPlugin.extract({
    use: [
      'css-loader?sourceMap',
      'postcss-loader',
      'sass-loader',
    ],
    fallback: 'style-loader',
  }),
};

loaders.files = {
  test: /\.(woff)$/,
  loader: 'file-loader',
};

plugins.html = new HtmlWebpackPlugin({
  template: './index.html',
  title: 'music-stats',
  favicon: '../assets/favicon/favicon.ico',
});

plugins.commonsChunk = new webpack.optimize.CommonsChunkPlugin({
  name: 'vendor',
  minChunks: (module) => module.context && module.context.includes('node_modules'),
  filename: `vendor${IS_PROD ? '-[hash].min' : ''}.js`,
});

plugins.extractText = new ExtractTextPlugin({
  filename: `styles${IS_PROD ? '-[hash].min' : ''}.css`,
});

plugins.copy = new CopyWebpackPlugin([
  {
    from: '../assets/favicon/*',
    to: '[name].[ext]',
  },
]);

plugins.uglifyJs = new webpack.optimize.UglifyJsPlugin({
  compress: {
    warnings: false,
  },
});

plugins.hotModuleReplacement = new webpack.HotModuleReplacementPlugin();

plugins.dashboard = new DashboardPlugin();

const config = {
  context: SRC_DIR,

  entry: [
    'babel-polyfill',
    './scripts/app.ts',
  ],

  output: {
    path: DIST_DIR,
    filename: `bundle${IS_PROD ? '-[hash].min' : ''}.js`,
    publicPath: PUBLIC_PATH,
  },

  resolve: {
    extensions: [
      '.ts',
      '.js',
      '.scss',
      '.json',
    ],
  },

  module: {
    rules: [
      loaders.tslint,
      loaders.ts,
      loaders.scss,
      loaders.files,
    ],
  },

  plugins: [
    plugins.html,
    plugins.commonsChunk,
    plugins.extractText,
    plugins.copy,
  ].concat(IS_PROD
    ? [
      plugins.uglifyJs,
    ]
    : [
      plugins.hotModuleReplacement,
      plugins.dashboard,
    ]
  ),

  devServer: {
    contentBase: DIST_DIR,
    hot: true,
    port: 8080,
  },

  devtool: 'inline-source-map',
};

module.exports = config;
