const path = require('path');
const webpack = require('webpack');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const SpriteLoaderPlugin = require('svg-sprite-loader/plugin');
const DefinePlugin = webpack.DefinePlugin;

const mainCss = new ExtractTextPlugin('styles/main.css');

// webpack.config.js
module.exports = (env) => {
  const fileName = 'index';
  return {
    devtool: 'source-map',
    target: 'web',
    entry: {
      [fileName]: [
        path.resolve(__dirname, '../preview/', fileName),
      ],
    },
    output: {
      path: path.resolve(__dirname, '../dev/'),
      filename: 'scripts/[name].js',
    },
    module: {
      rules: [
        {
          test: /.*(\.tsx|\.ts|\.jsx)$/,
          exclude: [
            path.resolve(__dirname, '../node_modules/'),
          ],
          use: 'awesome-typescript-loader',
        },
        {
          test: /\.js$/,
          enforce: 'pre',
          loader: 'source-map-loader',
        },
        {
          test: /\.less$/,
          exclude: [
            path.resolve(__dirname, '../node_modules/'),
            path.resolve(__dirname, '../src/styles/'),
          ],
          use: mainCss.extract({
            fallback: 'style-loader',
            use: [
              {
                loader: 'css-loader',
                query: {
                  minimize: 1,
                  modules: 1,
                  importLoaders: 1,
                  camelCase: true,
                  localIdentName: '[local]',
                },
              }, {
                loader: 'less-loader',
              },
            ],
          }),
        },
        {
          test: /\.svg$/,
          exclude: [],
          use: [
            {
              loader: 'svg-sprite-loader',
              options: {
                extract: true,
                spriteFilename: 'material-icons-sprite.svg',
              },
            },
          ],
        },
        {
          test: /\.(ttf|eot|woff|woff2)(\?[a-z0-9\-#]+)?$/,
          use: [
            {
              loader: 'file-loader',
              query: {
                name: 'styles/fonts/[hash:base64:5]__[name].[ext]',
                publicPath: '//127.0.0.1:8888/',
              },
            },
          ],
        },
      ],
    },
    resolve: {
      modules: [
        path.resolve(__dirname, '../components/'),
        path.resolve(__dirname, '../preview/'),
        '../node_modules/',
      ],
      extensions: ['.tsx', '.ts', '.js'],
      alias: {},
    },
    devServer: {
      contentBase: path.resolve(__dirname, '..'),
      compress: true,
      port: 8888,
    },
    plugins: [
      mainCss,
      new HtmlWebpackPlugin({
        filename: 'index.html',
        template: path.resolve(__dirname, '../preview/index.html'),
      }),
      new SpriteLoaderPlugin(),
      new DefinePlugin({
        SVG_SPRITE: false,
      }),
    ],
  };
};
