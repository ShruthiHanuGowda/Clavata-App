// const {getDefaultConfig, mergeConfig} = require('@react-native/metro-config');
// const {
//   wrapWithReanimatedMetroConfig,
// } = require('react-native-reanimated/metro-config');
// /**
//  * Metro configuration
//  * https://facebook.github.io/metro/docs/configuration
//  *
//  * @type {import('metro-config').MetroConfig}
//  */
// const config = {};

// module.exports = wrapWithReanimatedMetroConfig(
//   mergeConfig(getDefaultConfig(__dirname), config),
// );

// // module.exports = wrapWithReanimatedMetroConfig(config);
const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');
const {
  wrapWithReanimatedMetroConfig,
} = require('react-native-reanimated/metro-config');

const config = {
  resolver: {
    sourceExts: ['js', 'jsx', 'ts', 'tsx'],
    resolverMainFields: ['react-native', 'browser', 'main'],
  },
};

module.exports = wrapWithReanimatedMetroConfig(
  mergeConfig(getDefaultConfig(__dirname), config),
);