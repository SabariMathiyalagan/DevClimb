// babel.config.js
module.exports = function (api) {
    api.cache(true);
    return {
      presets: ['babel-preset-expo'],
      plugins: [
        ['module-resolver', {
          root: ['./'],
          alias: { '@': './' }, // 👈 matches tsconfig "@/*": "./*"
          extensions: ['.tsx', '.ts', '.js', '.json']
        }],
        'react-native-reanimated/plugin', // must be last
      ],
    };
  };
  