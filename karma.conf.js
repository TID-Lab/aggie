'use strict';

module.exports = function(karma) {
  karma.set({

    frameworks: ['mocha', 'chai', 'browserify'],

    preprocessors: {
      'public/angular/templates/**/*.html': ['ng-html2js'],
      'public/angular/js/app.js': ['browserify']
    },

    files: [
      'test/frontend/vendor/jquery-1.11.0.min.js',
      'public/angular/js/app.js',
      'public/angular/templates/**/*.html',
      'node_modules/angular-mocks/angular-mocks.js',
      'node_modules/socket.io-client/dist/socket.io.js',
      'test/frontend/**/*.test.js'
    ],

    reporters: ['dots'],

    ngHtml2JsPreprocessor: {
      stripPrefix: 'public/angular',
      moduleName: 'aggie.templates'
    },

    browsers: ['PhantomJS'],

    // Possible values: karma.LOG_DISABLE, karma.LOG_ERROR, karma.LOG_WARN,
    // karma.LOG_INFO, karma.LOG_DEBUG
    logLevel: karma.LOG_INFO,
    singleRun: false,
    autoWatch: true,

    browserify: {
      debug: true
    }
  });
};
