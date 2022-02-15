const path = require('path');
const dotenv = require('dotenv');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
// const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

dotenv.config();

const {NODE_ENV, PUBLIC_PATH, MAPBOX_ACCESS_TOKEN} = process.env;

if (!MAPBOX_ACCESS_TOKEN) {
  console.error('Config error: MAPBOX_ACCESS_TOKEN env var is not set');
  process.exit(1);
}

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
  use: [MiniCssExtractPlugin.loader, 'css-loader']
};

loaders.scss = {
  test: /\.scss$/,
  use: [MiniCssExtractPlugin.loader, 'css-loader', 'postcss-loader', 'sass-loader']
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
  title: `${IS_PROD ? '' : '[dev] '}music-stats - map`,
});

plugins.miniCss = new MiniCssExtractPlugin({
  filename: `styles${IS_PROD ? '-[hash].min' : ''}.css`,
});

plugins.copy = new CopyWebpackPlugin({
  patterns: [
    {
      from: '../assets/favicon/*',
      to: '[name][ext]',
    },
    {
      from: '../data/*',
      to: 'data/[name][ext]',
    },
  ],
});

// plugins.bundleAnalyzer = new BundleAnalyzerPlugin();

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
    plugins.miniCss,
    plugins.copy,
  ].concat(IS_PROD
    ? []
    : [
      // plugins.bundleAnalyzer,
    ],
  ),

  devServer: {
    static: {
      directory: DIST_DIR,
    },
  },

  devtool: 'inline-source-map',
};

module.exports = config;
