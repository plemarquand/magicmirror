'use strict';

var path = require('path');
var gulp = require('gulp');
var gutil = require('gulp-util');
var browserify = require('browserify');
var rimraf = require('gulp-rimraf');
var nodemon = require('gulp-nodemon');
var less = require('gulp-less');
var babel = require('gulp-babel');
var source = require('vinyl-source-stream');
var autoprefixer = require('gulp-autoprefixer');
var runSequence = require('run-sequence');

var jsSrc = './src/**/*.es6';
var outputDir = './dist/';

gulp.task('clean', () => gulp.src('dist', {read: false})
  .pipe(rimraf()));

gulp.task('js', () => gulp.src(jsSrc)
  .pipe(babel())
  .pipe(gulp.dest(outputDir)));
gulp.task('js-watch', ['js']);

gulp.task('serve', () => {
  nodemon({
    script: 'dist/index.js',
    ext: 'js html',
    env: {'NODE_ENV': 'development'}
  })

  gulp.watch(jsSrc, ['js-watch']);
});

gulp.task('default', (callback) => runSequence('clean', ['js'], 'serve', callback));