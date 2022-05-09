module.exports = function override(config, env) {
  config.resolve.fallback = Object.assign(config.resolve.fallback || {}, {
    stream: require.resolve('stream-browserify'),
  });

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
