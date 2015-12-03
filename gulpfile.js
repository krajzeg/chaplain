var gulp = require('gulp');
var del = require('del');
var path = require('path');
var _ = require('lodash');

gulp.task('default', ['compile']);
gulp.task('compile', ['compile-lib', 'compile-test']);
gulp.task('clean', function(done) {
  del("dist", done);
});

gulp.task('compile-lib', makeES6Tasks('lib', 'dist/lib'));
gulp.task('compile-test', makeES6Tasks('test', 'dist/test'));

// ========================================================================

function makeES6Tasks(srcDirectory, distDirectory) {
  gulp.task('clean:' + srcDirectory, makeCleanTask(distDirectory));
  gulp.task('copy-json:' + srcDirectory, makeCopyJsonTask(srcDirectory, distDirectory));
  gulp.task('compile-js:' + srcDirectory, makeES6CompileTask(srcDirectory, distDirectory));
  return ['clean', 'copy-json', 'compile-js'].map(function(prefix){
    return [prefix, srcDirectory].join(":");
  });
}

function makeCleanTask(directory) {
  var del = require('del');
  return function(cb) {
    del(directory, cb);
  }
}

function makeES6CompileTask(source, destination) {
  var sources = path.join(source, '**/*.js');

  return function() {
    var babel = require('gulp-babel');
    var sourcemaps = require('gulp-sourcemaps');

    return gulp.src(sources)
      .pipe(sourcemaps.init())
      .pipe(babel({
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
