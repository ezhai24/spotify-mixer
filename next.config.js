const Dotenv = require('dotenv-webpack');

module.exports = {
  webpack: (config) => {
    config.plugins.push(
      new Dotenv({
        safe: true,
        silent: true,
      })
    );
    
    return config;
  },
};
