'use strict';

var gulp = require('gulp');
var jshint = require('gulp-jshint');
var mocha = require('gulp-mocha');
var rename = require('gulp-rename');
var browserify = require('browserify');
var source = require('vinyl-source-stream');
var streamify = require('gulp-streamify')
var uglify = require('gulp-uglify');
var buffer = require('vinyl-buffer');
var ngAnnotate = require('gulp-ng-annotate');
var sourcemaps = require('gulp-sourcemaps');
var plumber = require('gulp-plumber');
var livereload = require('gulp-livereload');
var jsoncombine = require('gulp-jsoncombine');
var sass = require('gulp-sass')(require('sass'));
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
  sass: 'public/angular/sass/app.scss',
  css: 'public/angular/css/',
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
  var bundle = browserify({
    entries: 'public/angular/js/app.js'
  }).bundle();
  return bundle
    .pipe(source('public/angular/js/app.js'))
    .pipe(plumber())
    .pipe(streamify(sourcemaps.init()))
    .pipe(ngAnnotate())
    .pipe(buffer())
    .pipe(uglify())
    .pipe(rename('app.min.js'))
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest('public/angular/js'));
};

pipes.debugAngular = function() {
  var bundle = browserify({
    entries: 'public/angular/js/app.js'
  }).bundle();
  return bundle
    .pipe(source('public/angular/js/app.js'))
    .pipe(plumber())
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

gulp.task('sass', function() {
  return pipes.buildStyles();
});

// Reload browser
gulp.task('angular.watch', function() {
  livereload.listen();
  gulp.watch(paths.angular, gulp.parallel('watchAngular'));
});

gulp.task('backend', function() {
  // Prefer cli argument, default to all test files
  gulp.src(testFile || paths.backend)
    .pipe(mocha({ reporter: 'spec' }))
    .on('error', _.identity);
});

gulp.task('watch', function() {
  gulp.watch([...paths.js, ...paths.backend], gulp.parallel('lint', 'backend'));
});

gulp.task('test', gulp.parallel('backend'));

gulp.task('default', gulp.parallel('lint', 'test', 'watch'));

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
      return new Buffer.from(JSON.stringify(result, null, 2));
    }))
    .pipe(gulp.dest(dirname));
};

pipes.buildStyles = function() {
  return gulp.src(paths.sass)
      .pipe(sass.sync().on('error', sass.logError))
      .pipe(gulp.dest(paths.css));
}
gulp.task('debugTranslations', function() {
  var stream1 = pipes.debugTranslations(paths.translations);
  var stream2 = pipes.debugTranslations(paths.translationsEmail);
  return merge(stream1, stream2);
});

gulp.task('build', gulp.parallel('debugTranslations', 'angular', 'sass'));
//TO DO: Code updated assuming the purpose is to run multiple tasks in parallel. Need to Verify this.
