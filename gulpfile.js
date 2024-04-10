import gulp from 'gulp';
import dartSass from 'sass';
import gulpSass from 'gulp-sass';
import concat from 'gulp-concat';
import terser from 'gulp-terser';
import postcss from 'gulp-postcss';
import autoprefixer from 'autoprefixer';
import cssnano from 'cssnano';
import replace from 'gulp-replace';
import browserSync from 'browser-sync';
import imagemin from 'gulp-imagemin';

const {src, dest, watch, series, parallel} = gulp;
const browser = browserSync.create();
const sass = gulpSass(dartSass);

const files = {
    scssPath: 'src/assets/scss/**/*.scss',
    jsPath: 'src/assets/js/**/*.js',
    htmlPath: 'src/html/*.html',
    imgPath: 'src/assets/img/**/*.*',
};

function scssTask(cb) {
    return src(files.scssPath, {sourcemaps: true})
        .pipe(sass({outputStyle: 'compressed', includePaths: ['node_modules']}).on('error', sass.logError))
        .pipe(postcss([autoprefixer()]))
        .pipe(dest('docs/assets/css/', {sourcemaps: '.'}))
        .on('end', cb);
}

function jsTask(cb) {
    return src(files.jsPath, {sourcemaps: true})
        .pipe(concat('app.js'))
        .pipe(terser())
        .pipe(dest('docs/assets/js/', {sourcemaps: '.'}))
        .on('end', cb);
}

function imgTask(cb) {
    return src(files.imgPath)
        .pipe(imagemin())
        .on('error', console.error) // Handle errors
        .pipe(dest('docs/assets/img/')) // Save optimized images
        .on('end', cb);
}

function htmlTask(cb) {
    return src(files.htmlPath)
        .pipe(dest('docs/'));
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
    browser.reload();
}

function watchTask(cb) {
    watch(files.scssPath, {debounceDelay: 100}, scssTask);
    watch(files.jsPath, {debounceDelay: 100}, jsTask);
    watch(files.htmlPath, {debounceDelay: 100}, series(htmlTask, cacheBustTask));
    watch(files.imgPath, {debounceDelay: 100}, imgTask);
    watch('docs/**/*.html').on('change', browserSyncReload);
    cb();
}

export default series(
    parallel(scssTask, jsTask, imgTask, htmlTask),
    cacheBustTask,
    browserSyncServe,
    watchTask
);