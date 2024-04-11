import gulp from 'gulp';
import * as dartSass from 'sass';
import gulpSass from 'gulp-sass';
import concat from 'gulp-concat';
import terser from 'gulp-terser';
import postcss from 'gulp-postcss';
import autoprefixer from 'autoprefixer';
import cssnano from 'cssnano';
import replace from 'gulp-replace';
import browserSync from 'browser-sync';
import imagemin, { gifsicle, mozjpeg, optipng, svgo } from 'gulp-imagemin';

const { src, dest, watch, series, parallel } = gulp;
const browser = browserSync.create();
const sass = gulpSass(dartSass);

const files = {
  scssPath: 'src/assets/scss/**/*.scss',
  jsPath: 'src/assets/js/**/*.js',
  htmlPath: 'src/html/*.html',
  imgPath: 'src/assets/img/**/*.{jpg,jpeg,png,svg}',
};

function scssTask(cb) {
  return src(files.scssPath, { sourcemaps: true })
    .pipe(sass({ outputStyle: 'compressed', includePaths: ['node_modules'] }).on('error', sass.logError))
    .pipe(postcss([autoprefixer()]))
    .pipe(dest('docs/assets/css/', { sourcemaps: '.' }))
    .on('end', cb);
}

function jsTask(cb) {
  return src(files.jsPath, { sourcemaps: true })
    .pipe(concat('app.js'))
    .pipe(terser())
    .pipe(dest('docs/assets/js/', { sourcemaps: '.' }))
    .on('end', cb);
}

function imgTask(cb) {
  return src(files.imgPath, { encoding: false })
    .pipe(imagemin([
      gifsicle({ interlaced: true }),
      mozjpeg({ quality: 75, progressive: true }),
      optipng({ optimizationLevel: 5 }),
      svgo({
        plugins: [
          {
            name: 'removeViewBox',
            active: true
          },
          {
            name: 'cleanupIDs',
            active: false
          }
        ]
      })
    ]))
    .on('error', console.error) // Handle errors
    .pipe(dest('docs/assets/img/')) // Save optimized images
    .on('end', cb);
}

gulp.task('images', imgTask);

function htmlTask(cb) {
  return src(files.htmlPath)
    .pipe(dest('docs/'))
    .on('end', cb);
}

function cacheBustTask(cb) {
  var cbString = new Date().getTime();
  return src(['src/html/index.html'])
    .pipe(replace(/cb=\d+/g, 'cb=' + cbString))
    .pipe(dest('docs/'))
    .on('end', cb);
}

function browserSyncServe(cb) {
  browser.init({
    server: {
      baseDir: 'docs/',
    },
    notify: {
      styles: {
        top: 'auto',
        bottom: '0',
      },
    },
  });
  cb();
}

function browserSyncReload() {
  console.log('relolzxcad')
  browser.reload();
}

function watchTask(cb) {
  watch(files.scssPath).on('all', gulp.series(scssTask, browserSyncReload));
  watch(files.jsPath).on('all', gulp.series(jsTask, browserSyncReload));
  watch(files.htmlPath).on('all', gulp.series(htmlTask, cacheBustTask, browserSyncReload));
  watch(files.imgPath).on('all', gulp.series('images', browserSyncReload));
  watch('docs/**/*.html').on('all', browserSyncReload);
  cb();
}

export default series(
  parallel(scssTask, jsTask, htmlTask, 'images'),
  cacheBustTask,
  browserSyncServe,
  watchTask
);