var gulp = require('gulp');
var jshint = require('gulp-jshint');
var mocha = require('gulp-mocha');
var concat = require('gulp-concat');

var paths = {
  js: ['lib/**/*.js', 'models/*.js'],
  test: ['test/*.test.js'],
  angular: {
    js: ['public/angular/js/angular.js',
    'public/angular/js/angular-ui-router.js',
    'public/angular/js/angular-resource.js',
    'public/angular/js/ui-bootstrap.js',
    'public/angular/js/app.js',
    'public/angular/js/routes.js',
    'public/angular/js/controllers/*.js',
    'public/angular/js/services/*.js']
  }
};

gulp.task('lint', function() {
  gulp.src(paths.js)
    .pipe(jshint())
    .pipe(jshint.reporter('default'));
});

gulp.task('angular', function() {
  gulp.src(paths.angular.js)
    .pipe(concat('app.min.js'))
    .pipe(gulp.dest('public/angular/js'));
});

gulp.task('angular.watch', function() {
  gulp.watch(paths.angular.js, ['angular']);
});

gulp.task('angular.lint', function() {
  gulp.src(paths.angular.js)
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
  gulp.patch(paths.angular.js, ['angular'])
});

gulp.task('default', ['lint', 'test', 'watch']);
