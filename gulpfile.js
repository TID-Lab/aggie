var glob = require('glob');
var gulp = require('gulp');
var jshint = require('gulp-jshint');
var mocha = require('gulp-mocha');
var concat = require('gulp-concat');
var rename = require('gulp-rename');
var browserify = require('gulp-browserify');
var watchify = require('gulp-watchify');

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
  test: ['test/*.test.js']
};

gulp.task('lint', function() {
  gulp.src(paths.js)
    .pipe(jshint())
    .pipe(jshint.reporter('default'));
});


gulp.task('angular', function() {
  gulp.src('public/angular/js/app.js')
    .pipe(browserify())
    .pipe(rename('app.min.js'))
    .pipe(gulp.dest('public/angular/js'));
});

gulp.task('angular.watch', watchify(function(watchify) {
  gulp.src('public/angular/js/app.js')
    .pipe(watchify({ watching: true }))
    .pipe(rename('app.min.js'))
    .pipe(gulp.dest('public/angular/js'));
}));

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
