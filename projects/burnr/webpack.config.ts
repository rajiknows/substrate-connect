import path from 'path';
import { Configuration } from 'webpack';
import nodeExternals from 'webpack-node-externals';
import ManifestPlugin from 'webpack-manifest-plugin';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import cssnano from 'cssnano';

import { SERVER_PORT, IS_DEV, WEBPACK_PORT } from './src/server/config';

const nodeModulesPath = path.resolve(__dirname, 'node_modules');
const targets = IS_DEV ? { chrome: '79', firefox: '72' } : '> 0.25%, not dead';

const config: Configuration = {
  mode: IS_DEV ? 'development' : 'production',
  devtool: IS_DEV ? 'inline-source-map' : false,
  entry: ['./src/index'],
  output: {
    path: path.join(__dirname, 'dist', 'statics'),
    filename: `[name]-[hash:8]-bundle.js`,
    chunkFilename: '[name]-[hash:8]-bundle.js',
    publicPath: '/statics/',
  },
  resolve: {
    extensions: ['.js', '.ts', '.tsx'],
  },
  optimization: {
    minimize: !IS_DEV,
    splitChunks: {
      cacheGroups: {
        vendors: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all',
          priority: 10,
        },
        material: {
          test: /[\\/]node_modules[\\/]@material-ui[\\/]/,
          name: 'material-ui',
          chunks: 'all',
          priority: 20,
        },
      },
    },
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        exclude: [/node_modules/, nodeModulesPath],
        use: {
          loader: 'babel-loader',
          options: {
            presets: [['@babel/env', { modules: false, targets }], '@babel/react', '@babel/typescript'],
            plugins: [
              '@babel/proposal-numeric-separator',
              '@babel/plugin-transform-runtime',
              ['@babel/plugin-proposal-decorators', { legacy: true }],
              ['@babel/plugin-proposal-class-properties', { loose: true }],
              '@babel/plugin-proposal-object-rest-spread',
            ],
          },
        },
      },
      {
        test: /\.css$/,
        use: [
          {
            loader: 'style-loader',
          },
          {
            loader: 'css-loader',
            options: {
              modules: true,
              localsConvention: 'camelCase',
              sourceMap: IS_DEV,
            },
          },
          {
            loader: 'postcss-loader',
            options: {
              sourceMap: IS_DEV,
              plugins: IS_DEV ? [cssnano()] : [],
            },
          }
        ],
      },
      {
        test: /.jpe?g$|.gif$|.png$|.svg$|.woff$|.woff2$|.ttf$|.eot$/,
        use: 'url-loader?limit=10000',
      },
    ],
  },
  devServer: {
    port: WEBPACK_PORT,
    overlay: IS_DEV,
    open: IS_DEV,
    openPage: `http://localhost:${SERVER_PORT}`,
  },
  plugins: [
    new ManifestPlugin(),
    new HtmlWebpackPlugin({   
      favicon: 'src/favicon.ico'
    })
  ]
};

export default config;
