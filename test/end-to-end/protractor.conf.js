'use strict';

exports.config = {
  allScriptsTimeout: 11000,

  specs: ['*.test.js'],

  capabilities: {
    browserName: 'chrome'
  },

  baseUrl: 'https://localhost:3000/',

  framework: 'mocha',
  mochaOpts: {
    timeout: 20000,
    slow: 2000
  }
};
