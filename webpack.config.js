const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const appDirectory = __dirname;

module.exports = {
    mode: 'development',

    entry: path.resolve(
        appDirectory,
        'index.web.js',
    ),

    output: {
        path: path.resolve(
            appDirectory,
            'dist',
        ),

        filename: 'bundle.js',

        clean: true,

        publicPath: '/',
    },

    resolve: {
        extensions: [
            '.web.tsx',
            '.web.ts',
            '.web.jsx',
            '.web.js',
            '.tsx',
            '.ts',
            '.jsx',
            '.js',
        ],

        alias: {
            /*
             * React Native -> React Native Web
             */
            'react-native$': 'react-native-web',

            /*
             * Web replacement for DatePicker
             */
            'react-native-date-picker$': path.resolve(
                appDirectory,
                'Src/web/react-native-date-picker.tsx',
            ),

            '@gorhom/bottom-sheet': path.resolve(
                __dirname,
                'Src/web/gorhom-bottom-sheet.tsx',
            ),

            'react-native/Libraries/Utilities/Platform': path.resolve(
                __dirname,
                'node_modules/react-native-web/dist/exports/Platform.js',
            ),

            /*
             * Web replacement for react-native-config
             */
            'react-native-config$': path.resolve(
                appDirectory,
                'Src/web/react-native-config.ts',
            ),

            /*
             * Web replacement for Razorpay native SDK
             */
            'react-native-razorpay$': path.resolve(
                appDirectory,
                'Src/web/react-native-razorpay.ts',
            ),

            /*
             * Web replacement for react-native-maps
             */
            'react-native-maps$': path.resolve(
                appDirectory,
                'Src/web/react-native-maps.tsx',
            ),
        },

        /*
         * Allows extensionless imports.
         */
        fullySpecified: false,
    },

    module: {
        rules: [
            /*
             * --------------------------------------------------
             * YOUR APPLICATION
             * --------------------------------------------------
             */
            {
                test: /\.[jt]sx?$/,

                include: [
                    path.resolve(
                        appDirectory,
                        'src',
                    ),

                    path.resolve(
                        appDirectory,
                        'Src',
                    ),

                    path.resolve(
                        appDirectory,
                        'components',
                    ),

                    path.resolve(
                        appDirectory,
                        'screens',
                    ),

                    path.resolve(
                        appDirectory,
                        'App.tsx',
                    ),

                    path.resolve(
                        appDirectory,
                        'App.jsx',
                    ),

                    path.resolve(
                        appDirectory,
                        'App.js',
                    ),

                    path.resolve(
                        appDirectory,
                        'index.web.js',
                    ),
                ],

                use: {
                    loader: 'babel-loader',
                },
            },

            /*
             * --------------------------------------------------
             * SELECTED REACT NATIVE PACKAGES
             * --------------------------------------------------
             *
             * Only compile packages that actually need Babel.
             *
             * DO NOT compile all node_modules.
             */
            {
                test: /\.[jt]sx?$/,

                include: [
                    path.resolve(
                        appDirectory,
                        'node_modules/react-native-calendars',
                    ),

                    path.resolve(
                        appDirectory,
                        'node_modules/react-native-reanimated',
                    ),

                    path.resolve(
                        appDirectory,
                        'node_modules/react-native-animatable',
                    ),

                    path.resolve(
                        appDirectory,
                        'node_modules/react-native-swipe-gestures',
                    ),

                    path.resolve(
                        appDirectory,
                        'node_modules/react-native-vector-icons',
                    ),
                ],

                use: {
                    loader: 'babel-loader',
                },
            },

            /*
             * --------------------------------------------------
             * IMAGES
             * --------------------------------------------------
             */
            {
                test: /\.(png|jpe?g|gif|svg|webp)$/i,

                type: 'asset/resource',
            },

            /*
             * --------------------------------------------------
             * ESM JavaScript
             * --------------------------------------------------
             */
            {
                test: /\.m?js$/,

                resolve: {
                    fullySpecified: false,
                },
            },
        ],
    },

    plugins: [
        new webpack.DefinePlugin({
            __DEV__: JSON.stringify(true),
        }),
        new HtmlWebpackPlugin({
            template: path.resolve(
                appDirectory,
                'public/index.html',
            ),
        }),
    ],

    devServer: {
        port: 3000,

        historyApiFallback: true,

        hot: true,

        open: true,

        static: {
            directory: path.resolve(
                appDirectory,
                'public',
            ),
        },
    },

    devtool: 'eval-source-map',
};

