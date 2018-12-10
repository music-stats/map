const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const dotenv = require('dotenv');

dotenv.config();

const {NODE_ENV, PUBLIC_PATH, MAPBOX_ACCESS_TOKEN} = process.env;

const IS_PROD = NODE_ENV === 'production';

const SRC_DIR = path.resolve('./src/');
const DIST_DIR = path.resolve('./dist/');
const NODE_MODULES_DIR = path.resolve('./node_modules/');

const ENV = {
  MAPBOX_ACCESS_TOKEN,
};

function wrapStringValues(env) {
  const wrappedEnv = {};

  Object.keys(env).forEach((name) => {
    wrappedEnv[name] = JSON.stringify(env[name]);
  });

  return wrappedEnv;
}

console.log('IS_PROD:', IS_PROD);
console.log('PUBLIC_PATH:', PUBLIC_PATH);
console.log('ENV:', ENV);

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
  loader: 'ts-loader',
  exclude: NODE_MODULES_DIR,
};

loaders.css = {
  test: /\.css$/,
  use: ExtractTextPlugin.extract({
    use: 'css-loader',
    fallback: 'style-loader',
  }),
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

loaders.url = {
  test: /\.svg$/,
  loader: 'url-loader',
};

loaders.files = {
  test: /\.(png|woff)$/,
  loader: 'file-loader',
};

plugins.define = new webpack.DefinePlugin({
  'process.env': wrapStringValues(ENV),
});

plugins.html = new HtmlWebpackPlugin({
  template: './index.html',
  title: 'music-stats',
  favicon: '../assets/favicon/favicon.ico',
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

plugins.hotModuleReplacement = new webpack.HotModuleReplacementPlugin();

const config = {
  mode: IS_PROD
    ? 'production'
    : 'development',

  context: SRC_DIR,

  entry: [
    './app.ts',
  ],

  output: {
    path: DIST_DIR,
    filename: `bundle${IS_PROD ? '-[hash].min' : ''}.js`,
    publicPath: PUBLIC_PATH,
  },

  resolve: {
    modules: [
      path.resolve('./'),
      'node_modules',
    ],
    extensions: [
      '.js',
      '.ts',
      '.css',
      '.scss',
      '.svg',
      '.json',
    ],
  },

  module: {
    rules: [
      loaders.tslint,
      loaders.ts,
      loaders.css,
      loaders.scss,
      loaders.url,
      loaders.files,
    ],
  },

  plugins: [
    plugins.define,
    plugins.html,
    plugins.extractText,
    plugins.copy,
  ].concat(IS_PROD
    ? []
    : [
      plugins.hotModuleReplacement,
    ],
  ),

  optimization: {
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        vendors: {
          // Prevents ".css" files from being extracted into a chunk.
          // Should be checked with a new version of "ExtractTextPlugin" and removed, if not needed.
          test: /[\\/]node_modules[\\/].*\.js$/,
        },
      },
    },
  },

  devServer: {
    contentBase: DIST_DIR,
    hot: true,
  },

  devtool: 'inline-source-map',
};

module.exports = config;
