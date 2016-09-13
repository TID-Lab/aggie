exports.config = {
  allScriptsTimeout: 11000,

  specs: ['todo.test.js'],

  capabilities: {
    'browserName': 'chrome'
  },

  baseUrl: 'http://localhost:8000/',
};
