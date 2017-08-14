const path = require('path');
const webpack = require('webpack');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const mainCss = new ExtractTextPlugin('styles/main.css');

// webpack.config.js
module.exports = (env) => {
  const fileName = env.file;
  return {
    devtool: 'cheap-module-eval-source-map',
    entry: {
      [fileName]: [
        path.resolve(__dirname, '../tests/', fileName),
      ],
    },
    output: {
      path: path.resolve(__dirname, '../dev/'),
      filename: 'scripts/[name].js',
    },
    module: {
      rules: [
        {
          test: /.*(\.js|\.tsx|\.ts|\.jsx)$/,
          exclude: [
            path.resolve(__dirname, '../node_modules/'),
          ],
          use: ['awesome-typescript-loader'],
        },
        {
          test: /\.scss$/,
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
          test: /.*(\.png|\.gif|\.svg)$/,
          exclude: [
            path.resolve(__dirname, '../src/scripts/vendor/wangEditor'),
          ],
          use: [
            {
              loader: 'url-loader',
              query: {
                hash: 'sha512',
                digest: 'hex',
                limit: 8000,
                name: 'images/[hash:base64:5]__[name].[ext]',
                publicPath: '//127.0.0.1:8888/',
              },
            },
            {
              loader: 'image-webpack-loader',
              options: {
                mozjpeg: {
                  quality: 65,
                },
                pngquant: {
                  quality: '65-90',
                  speed: 4,
                },
                svgo: {
                  plugins: [
                    {
                      removeViewBox: false,
                    },
                    {
                      removeEmptyAttrs: false,
                    },
                  ],
                },
              },
            },
          ],
        },
        {
          test: /\.(ttf|eot|svg|woff|woff2)(\?[a-z0-9\-#]+)?$/,
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
        path.resolve(__dirname, '../src/scripts/'),
        '../node_modules/',
      ],
      extensions: ['.ts', '.tsx', '.js'],
      alias: {},
    },
    devServer: {
      contentBase: path.resolve(__dirname, '../dev/'),
      compress: true,
      port: 8888,
    },
    plugins: [
      mainCss,
      new HtmlWebpackPlugin({
        filename: 'index.html',
        template: path.resolve(__dirname, '../index.html'),
      }),
    ],
  }
};
