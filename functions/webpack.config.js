'use strict';

var nodeExternals = require('webpack-node-externals');
var path = require('path')

console.log(path.resolve(__dirname, 'src' , 'index.ts'));

module.exports = {
    entry: path.resolve(__dirname, 'src' , 'index.ts'),
    output: {
        path: path.resolve(__dirname, 'lib'),
        filename: 'index.js',
        libraryTarget: 'this'
    },
    target: 'node',
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                loader: 'ts-loader',
                options: {
                    transpileOnly: true
                }
            }
        ]
    },
    resolve: {
        extensions: ['.ts', '.tsx', '.js']
    },
    externals: [nodeExternals()]
};