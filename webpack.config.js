const webpack = require('webpack');
const AssetsPlugin = require('assets-webpack-plugin');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');

module.exports = (env, options) => {
    const outputFileName = options.mode === 'development' ? '[name].js' : '[name]-[chunkhash].js';
    const publicPath = options.mode === 'development' ? 'http://localhost:8080/build/' : '/build/';
    return {
        entry: {
            app: __dirname + '/assets/app/jsx/index.jsx'
        },
        output: {
            path: __dirname + '/public/build',
            publicPath: publicPath,
            filename: outputFileName
        },
        module: {
            rules: [
                {
                    test: /\.(js|jsx)$/,
                   // exclude: /node_modules/,
                    loader: 'babel-loader',
                    options: {
                        presets: [
                            ['@babel/preset-env', {targets: {node: 'current'}}],
                            '@babel/preset-react',
                            {plugins: ['@babel/plugin-proposal-class-properties']}
                        ]
                    }
                },
                {
                    test: /\.(jpe?g|png|gif|woff|woff2|eot|ttf|svg)(\?[a-z0-9=.]+)?$/,
                    loader: 'url-loader?limit=100000'
                }
            ]
        },

        plugins: [
            new AssetsPlugin({
                path: __dirname + '/assets',
                fullPath: true
            })
        ],
        optimization: {
            minimizer: [
                new UglifyJSPlugin({
                    uglifyOptions: {
                        compress: {
                            drop_console: true,
                        }
                    }
                })
            ]
        }
    };
};
