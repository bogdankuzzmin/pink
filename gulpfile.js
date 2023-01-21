'use strict'

var gulp = require('gulp'),
    less = require('gulp-less'),
    plumber = require('gulp-plumber'),
    postcss = require('gulp-postcss'),
    autoprefixer = require('autoprefixer'),
    minify = require('gulp-csso'),
    uglify = require('gulp-uglify'),
    rename = require('gulp-rename'),
    imagemin = require('gulp-imagemin'),
    webp = require('gulp-webp'),
    svgstore = require('gulp-svgstore'),
    posthtml = require('gulp-posthtml'),
    htmlmin = require('gulp-htmlmin'),
    include = require('posthtml-include'),
    server = require('browser-sync').create(),
    del = require('del'),
    dir = {
      build: 'source/build',
      html: 'source/**/*.html',
      css: 'source/styles/**/*.less',
      script: 'source/js/*.js',
      fonts: 'source/fonts/**',
      img: 'source/img/**/*'
    };

gulp.task('style', function () {
  return gulp.src('source/styles/style.less')
    .pipe(plumber())
    .pipe(less())
    .pipe(postcss([
      autoprefixer()
    ]))
    .pipe(gulp.dest('source/build/css'))
    .pipe(minify())
    .pipe(rename('style.min.css'))
    .pipe(gulp.dest('source/build/css'))
    .pipe(server.stream());
});

// gulp.task('copy:favicon', function () {
//   return gulp.src('source/favicon.png')
//     .pipe(gulp.dest('source/build/'))
// });

gulp.task('copy:fonts', function () {
  return gulp.src('source/fonts/**/*')
    .pipe(gulp.dest('source/build/fonts'))
});

gulp.task("serve", function () {
  server.init({
    server: "source/build"
  });
  server.watch('source/build', server.reload)
});

gulp.task('watch', function () {
  gulp.watch('source/styles/**/*.less', gulp.series('style'));
  gulp.watch('source/*.html', gulp.series('html'));
  gulp.watch('source/js/*.js', gulp.series('uglify'));
  // gulp.watch('source/*.html').on('change', server.reload);
});

gulp.task('images', function () {
  return gulp.src('source/img/**/*.{png,jpg,svg}')
    .pipe(imagemin([
    imagemin.optipng({optimizationLevel: 3}),
    imagemin.jpegtran({progressive: true}),
    // imagemin.svgo()
  ]))
  .pipe(gulp.dest('source/build/img'));
});


gulp.task('webp', function () {
  return gulp.src('source/img/**/*.{png,jpg}')
    .pipe(webp({quality: 90}))
    .pipe(gulp.dest('source/build/img'))
});

gulp.task('sprite', function () {
  return gulp.src(['source/build/img/icon-*.svg', 'source/build/img/spr-*.svg'])
    .pipe(svgstore({
      inlineSvg: true
    }))
    .pipe(rename('sprite.svg'))
    .pipe(gulp.dest('source/build/img'));
});

gulp.task('html', function () {
  return gulp.src('source/*.html')
    .pipe(posthtml([
      include()
    ]))
    // .pipe(rename('index.nomin.html'))
    // .pipe(gulp.dest('source/build'))
    .pipe(htmlmin({ collapseWhitespace: true }))
    .pipe(rename('index.html'))
    .pipe(gulp.dest('source/build'));
});

gulp.task("uglify", function () {
  return gulp.src('source/js/*.js')
    .pipe(uglify())
    .pipe(gulp.dest('source/build/js/'));
});

gulp.task('clean', function () {
    return del([dir.build]);
});

gulp.task('build', gulp.series('clean', 'style', 'uglify', 'copy:fonts', 'images', 'sprite', 'webp', 'html'));

gulp.task('sw', gulp.parallel('watch', 'serve'));

gulp.task('default', gulp.series(
  'clean', 'style', 'uglify', 'copy:fonts', 'images', 'sprite', 'webp', 'html',
  gulp.parallel('watch', 'serve')
));
