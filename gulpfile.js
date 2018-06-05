/*eslint-env node */

var gulp = require('gulp');
var sass = require('gulp-sass');
var autoprefixer = require('gulp-autoprefixer');
var browserSync = require('browser-sync').create();
 //browserSync.stream();
var eslint = require('gulp-eslint');
var concat = require('gulp-concat');



gulp.task('styles', function(done) {
	// look for .scss files in sass folder and subdirs
	gulp.src('sass/**/*.scss')
		.pipe(sass({
			outputStyle: 'compressed'
		}).on('error', sass.logError))
		.pipe(autoprefixer({
			browsers: ['last 2 versions']
		}))
		.pipe(gulp.dest('./dist/css'));

	console.log("Css generated in dist/css folder!");
	done();
});

/* copy index.html into dist folder */
gulp.task('copy-html', function() {
	gulp.src('./index.html')
		.pipe(gulp.dest('./dist'));

	console.log("Index.html copied into dist folder!");
});


gulp.task('scripts', function() {
	gulp.src('js/**/*.js')
		.pipe(concat('all.js'))
		.pipe(gulp.dest('dist/js'));
});

gulp.task('scripts-dist', function() {
	gulp.src('js/**/*.js')
		.pipe(concat('all.js'))
		.pipe(gulp.dest('dist/js'));
});

/* copy images into dist/img folder */
gulp.task('copy-images', function() {
	gulp.src('img/*')
		.pipe(gulp.dest('dist/img'));

	console.log("Images copied into dist/img folder!");
});


gulp.task('lint', () => {
	// ESLint ignores files with "node_modules" paths.
	// So, it's best to have gulp ignore the directory as well.
	// Also, Be sure to return the stream from the task;
	// Otherwise, the task may end before the stream has finished.
	return gulp.src(['**/*.js','!node_modules/**'])
		// eslint() attaches the lint output to the "eslint" property
		// of the file object so it can be used by other modules.
		.pipe(eslint())
		// eslint.format() outputs the lint results to the console.
		// Alternatively use eslint.formatEach() (see Docs).
		.pipe(eslint.format())
		// To have the process exit with an error code (1) on
		// lint error, return the stream and pipe to failAfterError last.
		.pipe(eslint.failAfterError());

});

gulp.task('default', gulp.series(['styles', 'lint', 'copy-html', 'copy-images'], function() {
	gulp.watch('sass/**/*.scss', gulp.series('styles'));
	gulp.watch('js/**/*.js', gulp.series('lint'));
	gulp.watch('/index.html', gulp.series('copy-html'));
	/* list to changes in index.html to aumatically reload the whole page */
	gulp.watch('./dist/index.html').on('change', browserSync.reload);

	browserSync.init({
		server: './dist'
	});

}));