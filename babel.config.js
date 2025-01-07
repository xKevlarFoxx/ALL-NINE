module.exports = function (api) {
    api.cache(true);
    return {
      presets: ['babel-preset-expo'],
      plugins: [
        'nativewind/babel',
        require.resolve('expo-router/babel'),
        'react-native-reanimated/plugin',
        [
          'module-resolver',
          {
            root: ['.'],
            alias: {
              '@': './',
              '@components': './components',
              '@constants': './constants',
              '@assets': './assets',
              '@hooks': './hooks',
              '@utils': './utils',
            },
          },
        ],
      ],
    };
  };