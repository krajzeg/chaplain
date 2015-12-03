var gulp = require('gulp');
var del = require('del');
var path = require('path');
var _ = require('lodash');

gulp.task('default', ['compile']);
gulp.task('compile', ['compile-lib', 'compile-test']);
gulp.task('clean', makeCleanTask('dist'));

gulp.task('compile-lib', makeES6Tasks('lib', 'dist/lib'));
gulp.task('compile-test', makeES6Tasks('test', 'dist/test'));

// ========================================================================

function makeES6Tasks(srcDirectory, distDirectory) {
  var clean = 'clean:' + srcDirectory;
  var copy = 'copy-json:' + srcDirectory;
  var compile = 'compile-js:' + srcDirectory;

  gulp.task(clean, makeCleanTask(distDirectory));
  gulp.task(copy, [clean], makeCopyJsonTask(srcDirectory, distDirectory));
  gulp.task(compile, [copy], makeES6CompileTask(srcDirectory, distDirectory));

  return [compile];
}

function makeCleanTask(directory) {
  var del = require('del');
  return function() {
    return del(directory);
  }
}

function makeES6CompileTask(source, destination) {
  var sourceFiles = path.join(source, '**/*.js');
  return function() {
    var babel = require('gulp-babel');
    var sourcemaps = require('gulp-sourcemaps');

    return gulp.src(sourceFiles)
      .pipe(sourcemaps.init())
      .pipe(babel({
        presets: ['es2015'],
        retainLines: true
      }))
      .pipe(sourcemaps.write('.', {
        sourceRoot: function(file) {
          // we have to go the right number of directories up
          var depth = file.relative.split('/').length + 1;
          var rootRelativePath = _.range(0, depth).map(function() { return '../'}).join('');
          return rootRelativePath + source;
        }
      }))
      .pipe(gulp.dest(destination));
  }
}

function makeCopyJsonTask(source, destination) {
  var sourcePattern = path.join(source, '**/*.json');
  return function() {
    return gulp.src(sourcePattern).pipe(gulp.dest(destination));
  };
}
