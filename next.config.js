const path = require('path');
const Dotenv = require('dotenv-webpack');

module.exports = {
  webpack: (config) => {
    config.plugins.push(
      new Dotenv({
        safe: true,
        silent: true,
      })
    );

    config.resolve.alias['~'] = path.resolve(__dirname);
    
    return config;
  },
};
