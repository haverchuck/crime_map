var gulp = require('gulp');
var minifyCss = require('gulp-minify-css');
var gulpWatch = require('gulp-watch');
var sass = require('gulp-sass');
var maps = require('gulp-sourcemaps');
var testFiles = ['./test/**/*.js'];
var webpack = require('webpack-stream');

gulp.task('static:dev', function() {
  gulp.src('app/**/*.html')
  .pipe(gulp.dest('build/'));
});

gulp.task('webpack:dev', function() {
  return gulp.src('app/js/entry.js')
  .pipe(webpack({
    output: {
      filename: 'bundle.js'
    }
  }))
  .pipe(gulp.dest('build/'));
});

gulp.task('styles:dev', function() {
  return gulp.src(['app/styles/**/*.scss'])
    .pipe(maps.init())
    .pipe(sass().on('error', sass.logError))
    .pipe(minifyCss())
    .pipe(maps.write('./'))
  .pipe(gulp.dest('build/styles/'));
});

gulp.task('css:watch', function () {
  gulp.watch('app/**/styles/*.css', ['styles:dev']);
});

gulp.task('photos:dev', function() {
  return gulp.src('app/photos/**/*.jpg')
  .pipe(gulp.dest('build/photos/'));
});

gulp.task('scripts:dev', function() {
  return gulp.src('app/scripts/**/*.js')
  .pipe(gulp.dest('build/scripts/'));
});

gulp.task('webpack:test', function() {
  return gulp.src('test/client/test_entry.js')
  .pipe(webpack ({
    output: {
      filename: 'test_bundle.js'
    }
  }))
  .pipe(gulp.dest('test/client/'));
});

gulp.task('build:dev', ['webpack:dev', 'static:dev', 'styles:dev', 'photos:dev', 'scripts:dev']);
gulp.task('default', ['build:dev']);
