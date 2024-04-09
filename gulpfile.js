//gulpfile.js
var gulp = require('gulp');
var sass = require('gulp-sass');
var browserSync = require('browser-sync').create();

function styles(done) {
    return gulp.src('scss/*.scss')
        .pipe(sass().on('error', sass.logError))
        .pipe(gulp.dest(cssDest))
        .pipe(browserSync.stream())
    done();
}

function watch(done) {
    browserSync.init({
        proxy: "http://testyt.local",
    })
    
    gulp.watch('sass/**/*.scss', styles);

    gulp.watch('./**/*.scss', browserSync.reload());
    gulp.watch('js/**/*.js', browserSync.reload());
    gulp.watch('./**/*.php', browserSync.reload());
    
    done();
}