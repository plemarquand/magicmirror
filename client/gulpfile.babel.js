'use strict';

var path = require('path');
var gulp = require('gulp');
var gutil = require('gulp-util');
var browserify = require('browserify');
var rimraf = require('gulp-rimraf');
var less = require('gulp-less');
var babelify = require('babelify');
var source = require('vinyl-source-stream');
var autoprefixer = require('gulp-autoprefixer');
var browserSync = require('browser-sync').create();
var runSequence = require('run-sequence');

var lessSrc = './src/css/**/*.less';
var jsSrc = './src/js/**/*.es6';
var assetSrc = './src/**/*.!(es6|less)';
var outputDir = './dist/';
var serverDir = '../server/www/';

gulp.task('clean', () => gulp.src('dist', {read: false})
  .pipe(rimraf()));

gulp.task('less', () => gulp.src(lessSrc)
  .pipe(less({paths: ['./css/includes']}))
  .pipe(autoprefixer({
    browsers: ['last 5 versions'],
    cascade: false
  }))
  .pipe(gulp.dest(path.join(outputDir, 'css'))))
  .on('error', gutil.log);

gulp.task('js', () => browserify({
    entries: './src/js/index.es6',
    extensions: ['.js','.json','.es6'],
    debug: true,
  })
  .transform(babelify)
  .bundle()
  .on('error', gutil.log)
  .pipe(source('index.js'))
  .pipe(gulp.dest(path.join(outputDir, 'js'))))
  .on('error', gutil.log);

gulp.task('copy_assets', () => gulp.src(assetSrc)
  .pipe(gulp.dest(outputDir)))
  .on('error', gutil.log);

gulp.task('copy_to_server', () => gulp.src(path.join(outputDir, '**/*'))
  .pipe(gulp.dest(serverDir)))
  .on('error', gutil.log);

gulp.task('js-watch', ['js', 'copy_to_server'], () => browserSync.reload());
gulp.task('less-watch', ['less', 'copy_to_server'], () => browserSync.reload());
gulp.task('asset-watch', ['copy_assets', 'copy_to_server'], () => browserSync.reload());

gulp.task('serve', () => {
  browserSync.init({
    proxy: 'http://localhost:8080',
    port: 3000
  });

  gulp.watch(jsSrc, ['js-watch']);
  gulp.watch(lessSrc, ['less-watch']);
  gulp.watch(assetSrc, ['asset-watch']);
});

gulp.task('default', (callback) => runSequence('clean', ['js', 'less', 'copy_assets'], 'copy_to_server', 'serve', callback));