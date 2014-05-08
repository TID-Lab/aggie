var gulp = require('gulp');
var jshint = require('gulp-jshint');
var mocha = require('gulp-mocha');

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
