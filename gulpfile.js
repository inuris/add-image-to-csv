var gulp = require('gulp');
var base64 = require('gulp-base64-inline');

function defaultTask() {
    return gulp.src('src/test.csv')
        .pipe(base64('images/',{
            prefix: "",
            suffix: "",
            includeMime: false
        }))
        .pipe(gulp.dest('dist/'));
}


exports.default = defaultTask