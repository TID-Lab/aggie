var browserify = require('browserify');
var source = require('vinyl-source-stream');
var glob = require('glob');
var gulp = require('gulp');
var jshint = require('gulp-jshint');
var mocha = require('gulp-mocha');
var concat = require('gulp-concat');

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
  angular: {
    js: ['public/angular/js/vendor/angular.js',
    'public/angular/js/vendor/*',
    'public/angular/js/app.js',
    'public/angular/js/routes.js',
    'public/angular/js/filters/*.js',
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
  var scripts = [];
  for (var path in paths.angular.js) {
    var files = glob.sync(paths.angular.js[path]);
    for (var f in files) {
      files[f] = './' + files[f];
    }
    scripts = scripts.concat(files);
  }
  browserify(scripts)
    .bundle()
    .pipe(source('app.min.js'))
    .pipe(gulp.dest('public/angular/js'));
});

gulp.task('angular.watch', ['angular'], function() {
  gulp.watch(paths.angular.js, ['angular']);
});

gulp.task('angular.lint', function() {
  gulp.src(paths.angular.js)
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
  gulp.watch(paths.angular.js, ['angular']);
});

gulp.task('default', ['lint', 'test', 'watch']);
