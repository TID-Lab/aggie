'use strict';

module.exports = function(karma) {
  karma.set({

    frameworks: ['mocha', 'chai', 'browserify'],

    preprocessors: {
      'public/angular/templates/**/*.html': ['ng-html2js'],
      'public/angular/js/app.js': ['browserify']
    },

    files: [
      'test/public/vendor/jquery-1.11.0.min.js',
      'public/angular/js/app.js',
      'public/angular/templates/**/*.html',
      'node_modules/angular-mocks/angular-mocks.js',
      'test/public/**/*.test.js'
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

    browserify: {
      debug: true
    }
  });
};
