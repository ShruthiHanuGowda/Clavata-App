const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
    mode: 'development',

    entry: path.resolve(
        __dirname,
        'index.web.tsx',
    ),

    output: {
        path: path.resolve(
            __dirname,
            'dist',
        ),

        filename: 'bundle.js',

        publicPath: '/',
    },

    resolve: {
        // IMPORTANT:
        // Webpack tries .web first.
        // Native files are only used by Metro for Android/iOS.
        extensions: [
            '.web.tsx',
            '.web.ts',

            '.tsx',
            '.ts',

            '.web.jsx',
            '.web.js',

            '.jsx',
            '.js',

            '.json',
        ],

        alias: {
            // React Native -> React Native Web
            'react-native$': 'react-native-web',
            'react-native-config': path.resolve(
                __dirname,
                'Src/web/config.web.ts'
            ),
        },
    },

    module: {
        rules: [
            {
                test: /\.[jt]sx?$/,

                exclude: /node_modules/,

                use: {
                    loader: 'babel-loader',
                },
            },

            {
                test: /\.css$/,

                use: [
                    'style-loader',
                    'css-loader',
                ],
            },

            {
                test: /\.(png|jpe?g|gif|svg)$/i,

                type: 'asset/resource',
            },
        ],
    },

    plugins: [
        new HtmlWebpackPlugin({
            template: path.resolve(
                __dirname,
                'web/index.html',
            ),
        }),
    ],

    devServer: {
        port: 3000,

        historyApiFallback: true,

        hot: true,

        open: true,
    },

    devtool: 'source-map',
};