//gulpfile.js
var gulp = require(' ');
var sass = require('gulp-sass');
var browserSync = require('browser-sync').create();

var scssSrc = 'src/assets/scss/*.scss'
var cssDest = 'docs/assets/css/'

function styles(done) {
    return gulp.src(scssSrc)
        .pipe(sass().on('error', sass.logError))
        .pipe(gulp.dest(cssDest))
        .pipe(browserSync.stream())
    done();
}

function watch(done) {
    browserSync.init({
        proxy: "http://testyt.local",
    })
    
    gulp.watch(scssSrc, styles);
    gulp.watch(scssSrc, browserSync.reload());
    // gulp.watch('js/**/*.js', browserSync.reload());
    // gulp.watch('./**/*.php', browserSync.reload());
    
    done();
}