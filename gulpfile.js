var glob = require('glob');
var gulp = require('gulp');
var jshint = require('gulp-jshint');
var mocha = require('gulp-mocha');
var concat = require('gulp-concat');
var rename = require('gulp-rename');
var browserify = require('gulp-browserify');
var plumber = require('gulp-plumber');
var livereload = require('gulp-livereload');

// Use --file=[filename] to run continuous tests on a file during development.
// Gulp will automatically run the tests on that file whenever the code changes
var testFile;
process.argv.forEach(function(arg) {
  if (arg.substr(0, 6) == '--file') {
    testFile = arg.split('=')[1];
  }
});

var paths = {
  js: ['lib/**/*.js', 'models/*.js'],
  test: ['test/*.test.js'],
  angular: ['public/angular/**/*.js',
    'public/angular/**/*.html',
    '!public/angular/js/app.min.js',
  ],
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
    .pipe(browserify())
    .pipe(rename('app.min.js'))
    .pipe(gulp.dest('public/angular/js'));
};

gulp.task('watchAngular', function() {
  buildAngular()
    .pipe(livereload());
});

gulp.task('angular', function() {
  pipes.buildAngular();
});

//Reload browser
gulp.task('angular.watch', function() {
  livereload.listen();
  gulp.watch(paths.angular, ['watchAngular']);
});

gulp.task('test', function() {
  // Prefer cli argument, default to all test files
  gulp.src(testFile || paths.test)
    .pipe(mocha({reporter: 'spec'}))
    .on('error', function() {});
});

gulp.task('watch', function() {
  gulp.watch(paths.js, ['lint', 'test']);
  gulp.watch(paths.test, ['lint', 'test']);
});

gulp.task('default', ['lint', 'test', 'watch']);
