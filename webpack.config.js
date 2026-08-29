
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
    mode: 'development',

    entry: path.resolve(
        __dirname,
        'index.web.js',
    ),

    output: {
        path: path.resolve(
            __dirname,
            'dist',
        ),

        filename:
            'bundle.[contenthash].js',

        clean: true,

        publicPath: '/',
    },

    resolve: {
        extensions: [
            '.web.tsx',
            '.web.ts',
            '.web.js',
            '.tsx',
            '.ts',
            '.js',
            '.jsx',
        ],

        alias: {
            'react-native$':
                'react-native-web',
        },
    },

    module: {
        rules: [
            {
                test: /\.[jt]sx?$/,
                exclude:
                    /node_modules/,

                use: {
                    loader: 'babel-loader',
                },
            },

            {
                test:
                    /\.(png|jpe?g|gif|svg|webp)$/i,

                type: 'asset/resource',
            },
        ],
    },

    plugins: [
        new HtmlWebpackPlugin({
            template:
                './public/index.html',
        }),
    ],

    devServer: {
        port: 3000,

        historyApiFallback: true,

        hot: true,

        open: true,

        static: {
            directory:
                path.join(
                    __dirname,
                    'public',
                ),
        },
    },

    devtool:
        'eval-source-map',
};

