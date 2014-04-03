var gulp = require('gulp');
var jshint = require('gulp-jshint');
var mocha = require('gulp-mocha');

var paths = { 
  js: ['controllers/**/*.js', 'models/*.js'],
  test: ['test/init.js', 'test/**/*.test.js']
};

gulp.task('lint', function() {
  gulp.src(paths.js)
    .pipe(jshint())
    .pipe(jshint.reporter('default'));
});

gulp.task('test', function() {
  gulp.src(paths.test)
    .pipe(mocha({reporter: 'spec'}))
    .on('error', function() {});
});

gulp.task('watch', function() {
  gulp.watch(paths.js, ['lint', 'test']);
  gulp.watch(paths.test, ['test']);
});

gulp.task('default', ['lint', 'test', 'watch']);
