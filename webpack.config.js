const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const appDirectory = __dirname;

module.exports = {
  mode: 'development',

  // ============================================================
  // ENTRY
  // ============================================================

  entry: path.resolve(
    appDirectory,
    'index.web.js',
  ),

  // ============================================================
  // OUTPUT
  // ============================================================

  output: {
    path: path.resolve(
      appDirectory,
      'dist',
    ),

    filename: 'bundle.js',

    clean: true,

    publicPath: '/',
  },

  // ============================================================
  // RESOLVE
  // ============================================================

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

    // IMPORTANT:
    // Webpack will prefer browser/module builds where available.
    mainFields: [
      'browser',
      'module',
      'main',
    ],

    alias: {
      // ========================================================
      // REACT NATIVE -> REACT NATIVE WEB
      // ========================================================

      'react-native$': 'react-native-web',

      // ========================================================
      // DATE PICKER WEB IMPLEMENTATION
      // ========================================================

      'react-native-date-picker$': path.resolve(
        appDirectory,
        'Src/web/react-native-date-picker.tsx',
      ),

      // ========================================================
      // GORHOM BOTTOM SHEET WEB IMPLEMENTATION
      // ========================================================

      '@gorhom/bottom-sheet': path.resolve(
        appDirectory,
        'Src/web/gorhom-bottom-sheet.tsx',
      ),

      // ========================================================
      // PLATFORM WEB IMPLEMENTATION
      // ========================================================

      'react-native/Libraries/Utilities/Platform': path.resolve(
        appDirectory,
        'node_modules/react-native-web/dist/exports/Platform.js',
      ),

      // ========================================================
      // REACT NATIVE CONFIG WEB IMPLEMENTATION
      // ========================================================

      'react-native-config$': path.resolve(
        appDirectory,
        'Src/web/react-native-config.ts',
      ),

      // ========================================================
      // RAZORPAY WEB IMPLEMENTATION
      // ========================================================

      'react-native-razorpay$': path.resolve(
        appDirectory,
        'Src/web/react-native-razorpay.ts',
      ),

      // ========================================================
      // REACT NATIVE MAPS WEB IMPLEMENTATION
      // ========================================================

      'react-native-maps$': path.resolve(
        appDirectory,
        'Src/web/react-native-maps.tsx',
      ),
    },

    // Allows imports without explicitly specifying extensions.
    fullySpecified: false,
  },

  // ============================================================
  // MODULE
  // ============================================================

  module: {
    rules: [

      // ========================================================
      // JAVASCRIPT / ESM / COMMONJS
      // ========================================================
      //
      // Important for packages such as Apollo Client.
      //
      // Apollo Client 3.14 contains a mixture of ESM/CommonJS
      // package files. javascript/auto allows Webpack to detect
      // the module format instead of treating everything as ESM.
      //
      // ========================================================

      {
        test: /\.m?js$/,

        resolve: {
          fullySpecified: false,
        },

        type: 'javascript/auto',
      },

      // ========================================================
      // YOUR APPLICATION
      // ========================================================

      {
        test: /\.[jt]sx?$/,

        include: [
          // Src
          path.resolve(
            appDirectory,
            'Src',
          ),

          // src
          path.resolve(
            appDirectory,
            'src',
          ),

          // components
          path.resolve(
            appDirectory,
            'components',
          ),

          // screens
          path.resolve(
            appDirectory,
            'screens',
          ),

          // IMPORTANT:
          // Includes root-level files such as:
          //
          // App.tsx
          // App.web.tsx
          // index.web.js
          //
          appDirectory,
        ],

        use: {
          loader: 'babel-loader',
        },
      },

      // ========================================================
      // SELECTED REACT NATIVE PACKAGES
      // ========================================================

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

      // ========================================================
      // IMAGES
      // ========================================================

      {
        test: /\.(png|jpe?g|gif|svg|webp)$/i,

        type: 'asset/resource',
      },

      // ========================================================
      // FONTS
      // ========================================================

      {
        test: /\.(woff|woff2|eot|ttf|otf)$/i,

        type: 'asset/resource',
      },
    ],
  },

  // ============================================================
  // PLUGINS
  // ============================================================

  plugins: [

    // React Native expects __DEV__
    new webpack.DefinePlugin({
      __DEV__: JSON.stringify(true),
    }),

    // HTML
    new HtmlWebpackPlugin({
      template: path.resolve(
        appDirectory,
        'public/index.html',
      ),
    }),
  ],

  // ============================================================
  // DEV SERVER
  // ============================================================

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

  // ============================================================
  // SOURCE MAP
  // ============================================================

  devtool: 'eval-source-map',
};