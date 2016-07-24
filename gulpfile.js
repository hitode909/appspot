const gulp   = require('gulp');
const source = require('vinyl-source-stream');
const browserify = require('browserify');

gulp.task('build', function() {
    browserify(
        {
            entries: ['htdocs/slitscan/main.coffee'],
            extensions: ['.coffee'],
            transform: ['coffeeify']
        }
    ).bundle(
    ).pipe(
        source('bundle.js')
    ).pipe(gulp.dest('htdocs/slitscan/'));
});

gulp.task('watch', function() {
    gulp.watch('htdocs/slitscan/*.coffee', ['build']);
});

gulp.task('default', ['build']);
