"use strict";

var path = require('path');
var webpack = require('webpack');
var ExtractTextPlugin = require('extract-text-webpack-plugin');
var CommonsChunkPlugin = webpack.optimize.CommonsChunkPlugin;
var ManifestPlugin = require('webpack-manifest-plugin');
var HtmlWebpackPlugin = require('html-webpack-plugin');
const { TsConfigPathsPlugin } = require('awesome-typescript-loader');

var mainCss = new ExtractTextPlugin('styles/main.css');

// webpack.config.js
module.exports = {
    devtool: 'cheap-module-eval-source-map',
    // target: 'electron-renderer',
    entry: {
        // index: [
        //     path.resolve(__dirname, '../dev/renderer/index.jsx'),
        // ]
        app: [
            path.resolve(__dirname, '../src/renderer/app.tsx')
        ]
    },
    output: {
        path: path.resolve(__dirname, '../dev/'),
        filename: "scripts/[name].js"
    },
    module: {
        rules: [
            {
                test: /.*(\.js|\.tsx|\.ts|\.jsx)$/,
                exclude: [
                    path.resolve(__dirname, '../node_modules/')
                ],
                use: ['awesome-typescript-loader']
            },
            {
                test: /\.css$/,
                exclude: [
                    path.resolve(__dirname, '../node_modules/'),
                    path.resolve(__dirname, '../src/styles/')
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
                                localIdentName: '[local]'
                            }
                        },
                        {
                            loader: 'postcss-loader'
                        },
                         {
                            loader: 'typed-css-modules-loader',
                            options: {
                                camelCase: true
                            }
                        }
                    ]
                })
            },
            // global css
            {
                test: /\.css$/,
                include: [
                    path.resolve(__dirname, '../src/styles/'),
                    path.resolve(__dirname, '../node_modules/'),
                ],
                use: [
                    'style-loader',
                    {
                        loader: 'css-loader',
                        query: {
                            minimize: 1
                        }
                    },
                    {
                        loader: 'postcss-loader'
                    }
                ]
            },
            {
                test: /.*(\.png|\.gif|\.svg)$/,
                exclude: [
                    path.resolve(__dirname, '../src/scripts/vendor/wangEditor')
                ],
                use: [
                    {
                        loader: 'url-loader',
                        query: {
                            hash: 'sha512',
                            digest: 'hex',
                            limit: 8000,
                            name: 'images/[hash:base64:5]__[name].[ext]',
                            publicPath: '//127.0.0.1:8888/'
                        }
                    },
                    {
                        loader: 'image-webpack-loader',
                        options: {
                            mozjpeg: {
                                quality: 65
                            },
                            pngquant:{
                                quality: "65-90",
                                speed: 4
                            },
                            svgo:{
                                plugins: [
                                    {
                                        removeViewBox: false
                                    },
                                    {
                                        removeEmptyAttrs: false
                                    }
                                ]
                            }
                        }
                    }
                ]
            },
            {
                test: /\.(ttf|eot|svg|woff|woff2)(\?[a-z0-9\-#]+)?$/,
                use: [
                    {
                        loader: 'file-loader',
                        query: {
                            name: 'styles/fonts/[hash:base64:5]__[name].[ext]',
                            publicPath: '//127.0.0.1:8888/'
                        }
                    }
                ]
            }
        ]
    },
    resolve: {
        modules: [
            path.resolve(__dirname, '../src/scripts/'),
            '../node_modules/'
        ],
        extensions: ['.ts', '.tsx', '.js'],
        alias: {
        }
    },
    devServer: {
        contentBase: path.resolve(__dirname, '../dev/'),
        compress: true,
        port: 8888 
    },
    plugins: [
        // new CommonsChunkPlugin({
        //     name: 'common',
        //     chunks: ['main'],
        //     minChunks: function (module, count) {
        //         return /\.js$/.test(module.resource) &&
        //             module.context.indexOf('components') !== -1 ||
        //             module.context.indexOf('utils') !== -1;
        //     }
        // }),
        new CommonsChunkPlugin({
            name: 'lib',
            chunks: ['main'],
            minChunks: function (module, count) {
                return (
                    module.resource &&
                        /\.js$/.test(module.resource) &&
                        module.resource.indexOf(
                            path.join(__dirname, '../node_modules')
                        ) === 0
                );
            }
        }),
        mainCss,
        new HtmlWebpackPlugin({
            filename: 'index.html',
            template: path.resolve(__dirname, '../src/index.html')
        })
    ]
};



