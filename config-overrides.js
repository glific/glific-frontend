const webpack = require('webpack');
module.exports = function override(config, env) {
  config.resolve.fallback = Object.assign(config.resolve.fallback || {}, {
    buffer: require.resolve('buffer'),
    stream: require.resolve('stream-browserify'),
  });

  config.plugins.push(
    new webpack.ProvidePlugin({
      Buffer: ['buffer', 'Buffer'],
      process: 'process/browser',
    })
  );

  config.module.rules = [
    ...config.module.rules,
    {
      test: /\.m?js/,
      resolve: {
        fullySpecified: false,
      },
    },
  ];

  config.ignoreWarnings = [/Failed to parse source map/];
  return config;
};
