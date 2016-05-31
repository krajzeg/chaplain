var gulp = require('gulp');
var path = require('path');
var _ = require('lodash');

gulp.task('default', ['make-runnable-binary']);

gulp.task('make-runnable-binary', ['compile'], function() {
  var chmod = require('gulp-chmod');
  gulp.src('dist/lib/cli/chaplain-cli.js')
    .pipe(chmod({
      owner: {execute: true},
      group: {execute: true},
      others: {execute: true}
    })).pipe(gulp.dest('dist/lib/cli'));
});

gulp.task('compile', ['compile-lib', 'compile-test', 'compile-chaplain-suite']);
gulp.task('clean', makeCleanTask('dist'));

gulp.task('compile-lib', makeES6Tasks('lib', 'dist/lib'));
gulp.task('compile-test', makeES6Tasks('test', 'dist/test'));
gulp.task('compile-chaplain-suite', makeES6Tasks('test-chaplain', 'dist/test-chaplain'));

// ========================================================================

function makeES6Tasks(srcDirectory, distDirectory) {
  var clean = 'clean:' + srcDirectory;
  var copy = 'copy-json:' + srcDirectory;
  var compile = 'compile-js:' + srcDirectory;

  gulp.task(clean, makeCleanTask(distDirectory));
  gulp.task(copy, makeCopyJsonTask(srcDirectory, distDirectory));
  gulp.task(compile, [copy], makeES6CompileTask(srcDirectory, distDirectory));

  return [compile];
}

function makeCleanTask(directory) {
  var del = require('del');
  return function() {
    return del(directory);
  };
}

function makeES6CompileTask(source, destination) {
  var sourceFiles = path.join(source, '**/*.js');
  return function() {
    var babel = require('gulp-babel');
    var changed = require('gulp-changed');
    var sourcemaps = require('gulp-sourcemaps');

    return gulp.src(sourceFiles)
      .pipe(changed(destination))
      .pipe(sourcemaps.init())
      .pipe(babel({
        presets: ['es2015'],
        retainLines: true
      }))
      .pipe(sourcemaps.write('.', {
        sourceRoot: function(file) {
          // we have to go the right number of directories up
          var depth = file.relative.split('/').length + 1;
          var rootRelativePath = _.range(0, depth).map(function() { return '../'; }).join('');
          return rootRelativePath + source;
        }
      }))
      .pipe(gulp.dest(destination));
  };
}

function makeCopyJsonTask(source, destination) {
  var sourcePattern = path.join(source, '**/*.json');
  return function() {
    var changed = require('gulp-changed');
    return gulp.src(sourcePattern)
      .pipe(changed(destination))
      .pipe(gulp.dest(destination));
  };
}
