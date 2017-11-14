'use strict';

var gulp = require('gulp');
var jshint = require('gulp-jshint');
var mocha = require('gulp-mocha');
var rename = require('gulp-rename');
var browserify = require('gulp-browserify');
var uglify = require('gulp-uglify');
var buffer = require('vinyl-buffer');
var ngAnnotate = require('gulp-ng-annotate');
var sourcemaps = require('gulp-sourcemaps');
var plumber = require('gulp-plumber');
var livereload = require('gulp-livereload');
var jsoncombine = require('gulp-jsoncombine');
var path = require('path');
var _ = require('lodash');
var merge = require('merge-stream');
var makeDebugDict = require('./gulp/make-debug-translations');

// Use --file=[filename] to run continuous tests on a file during development.
// Gulp will automatically run the tests on that file whenever the code changes
var testFile;
process.argv.forEach(function(arg) {
  if (arg.substr(0, 6) === '--file') {
    testFile = arg.split('=')[1];
  }
});

var paths = {
  js: ['lib/**/*.js', 'models/*.js'],
  backend: ['test/backend/*.test.js'],
  angular: ['public/angular/**/*.js',
    'public/angular/**/*.html',
    '!public/angular/js/app.min.js'
  ],
  translations: 'public/angular/translations/',
  translationsEmail: 'lib/translations/'
};

var pipes = {};

gulp.task('lint', function() {
  gulp.src(paths.js)
    .pipe(jshint())
    .pipe(jshint.reporter('default'));
});

pipes.buildAngular = function() {
  return gulp.src('public/angular/js/app.js')
    .pipe(plumber())
    .pipe(sourcemaps.init())
    .pipe(browserify())
    .pipe(ngAnnotate())
    .pipe(buffer())
    .pipe(uglify())
    .pipe(rename('app.min.js'))
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest('public/angular/js'));
};

pipes.debugAngular = function() {
  return gulp.src('public/angular/js/app.js')
    .pipe(plumber())
    .pipe(browserify())
    .pipe(rename('app.min.js'))
    .pipe(gulp.dest('public/angular/js'));
};

gulp.task('watchAngular', function() {
  pipes.debugAngular()
    .pipe(livereload());
});

gulp.task('angular', function() {
  return pipes.buildAngular();
});

// Reload browser
gulp.task('angular.watch', function() {
  livereload.listen();
  gulp.watch(paths.angular, ['watchAngular']);
});

gulp.task('backend', function() {
  // Prefer cli argument, default to all test files
  gulp.src(testFile || paths.backend)
    .pipe(mocha({ reporter: 'spec' }))
    .on('error', _.identity);
});

gulp.task('watch', function() {
  gulp.watch(paths.js, ['lint', 'backend']);
  gulp.watch(paths.backend, ['lint', 'backend']);
});

gulp.task('test', ['backend']);

gulp.task('default', ['lint', 'test', 'watch']);

/*
 * Takes a directory of translation dictionaries named locale-foo.json and
 * creates a new dictionary locale-debug.json which has all the (deep) keys of
 * the input files and whose values are ALL_CAPS_UNDERSCORE_DELIMITED, plus
 * any {{interpolated}} {{parameters}} found in the input strings.
 */
pipes.debugTranslations = function(dirname) {
  var debugFilename = 'locale-debug.json';
  return gulp.src([
    '!' + path.join(dirname, debugFilename),
    path.join(dirname, 'locale-*.json')
  ])
    .pipe(jsoncombine(debugFilename, function(data) {
      var result = makeDebugDict(_.values(data));
      return new Buffer(JSON.stringify(result, null, 2));
    }))
    .pipe(gulp.dest(dirname));
};

gulp.task('debugTranslations', function() {
  var stream1 = pipes.debugTranslations(paths.translations);
  var stream2 = pipes.debugTranslations(paths.translationsEmail);
  return merge(stream1, stream2);
});

gulp.task('build', ['debugTranslations', 'angular']);
