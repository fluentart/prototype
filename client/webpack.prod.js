"use strict";
const MonacoWebpackPlugin = require('monaco-editor-webpack-plugin');

module.exports = {
    //devtool: "inline-source-map",
    entry: "./src/index.tsx",
    output: { filename: "bundle.js" },
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
    plugins: [new MonacoWebpackPlugin()]
    // plugins: [new webpack.ProvidePlugin({
    //   'api': 'api'
    // })]
};
