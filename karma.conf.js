'use strict';

module.exports = function(karma) {
  karma.set({

    frameworks: ['mocha', 'browserify'],

    preprocessors: {
      'public/angular/templates/**/*.html': ['ng-html2js'],
      'public/angular/js/app.js': ['browserify']
    },

    files: [
      'test/public/vendor/jquery-1.11.0.min.js',
      'public/angular/js/app.js',
      'public/angular/templates/**/*.html',
      'node_modules/chai/chai.js',
      'node_modules/angular-mocks/angular-mocks.js',
      'test/public/**/*.test.js'
    ],

    plugins: [
      'karma-browserify',
      'karma-mocha',
      'karma-phantomjs-launcher',
      'karma-ng-html2js-preprocessor'
    ],

    reporters: ['dots'],

    ngHtml2JsPreprocessor: {
      stripPrefix: 'public/angular',
      moduleName: 'aggie.templates'
    },

    browsers: ['PhantomJS'],

    logLevel: 'LOG_DEBUG',
    singleRun: false,
    autoWatch: true,

    // browserify configuration
    browserify: {
      debug: true,
      transform: ['browserify-shim']
    }
  });
};