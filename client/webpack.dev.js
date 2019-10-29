"use strict";

// var webpack = require("webpack");
// const path = require("path");
// const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

const ExtraWatchWebpackPlugin = require('extra-watch-webpack-plugin');
const MonacoWebpackPlugin = require('monaco-editor-webpack-plugin');

module.exports = {
    // Set debugging source maps to be "inline" for
    // simplicity and ease of use
    // todo: disable for production

    devtool: "inline-source-map",

    // The application entrypoint
    entry: "./src/index.tsx",

    // Where to compile the bundle
    // By default the output directory is `dist`
    output: {
        filename: "bundle.js"
    },

    // Supported file loaders
    module: {
        rules: [{
            test: /\.scss$/,
            use: [
                "style-loader", // creates style nodes from JS strings
                "css-loader", // translates CSS into CommonJS
                "sass-loader" // compiles Sass to CSS, using Node Sass by default
            ]
        },
        {
            test: /\.tsx?$/,
            loader: "ts-loader"
        },
        {
            test: /\.css$/,
            use: [{
                loader: "style-loader"
            },
            {
                loader: "css-loader"
            }
            ]
        }
        ]
    },

    // File extensions to support resolving
    resolve: {
        extensions: [".ts", ".tsx", ".js"]
    },
    plugins: [new MonacoWebpackPlugin(), new ExtraWatchWebpackPlugin({ dirs: ['../plugins'] })]
    // plugins: [new webpack.ProvidePlugin({
    //   'api': 'api'
    // })]
};
