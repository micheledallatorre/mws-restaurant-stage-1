/*eslint-env node */

var gulp = require('gulp');
var sass = require('gulp-sass');
var autoprefixer = require('gulp-autoprefixer');
var browserSync = require('browser-sync').create();
//browserSync.stream();
var eslint = require('gulp-eslint');
//var jasmine = require('gulp-jasmine-phantom');
var concat = require('gulp-concat');
/*eslint-disable no-unused-vars*/
var uglify = require('gulp-uglify');
/*eslint-enable no-unused-vars*/
var babel = require('gulp-babel');



gulp.task('styles', function(done) {

  gulp.src('./sass/leaflet.css')
    .pipe(gulp.dest('./dist/css'));  

    
  // look for .scss files in sass folder and subdirs
  gulp.src('sass/**/*.scss')
    .pipe(sass({
      outputStyle: 'compressed'
    }).on('error', sass.logError))
    .pipe(autoprefixer({
      browsers: ['last 2 versions']
    }))
    .pipe(gulp.dest('./dist/css'));

  console.log('Css generated in dist/css folder!');
  done();
});

/* copy index.html into dist folder */
gulp.task('copy-html', function(done) {
  gulp.src('./*.html')
    .pipe(gulp.dest('./dist'));
  console.log('Index.html copied into dist folder!');
  done();
});


gulp.task('scripts', function(done) {
  gulp.src('sw.js')
    .pipe(gulp.dest('dist/'));  
  gulp.src('js/**/*.js')
    .pipe(babel())
    .pipe(concat('all.js'))
    .pipe(gulp.dest('dist/js'));

  console.log('Javascript babel and concatenated into dist/js folder!');
  done();
});

gulp.task('scripts-dist', function(done) {
  gulp.src('sw.js')
    .pipe(gulp.dest('dist/'));  
  gulp.src('js/**/*.js')
    //.pipe(concat('all.js'))
    //.pipe(uglify())
    .pipe(gulp.dest('dist/js'));

  console.log('Javascript minified and concatenated into dist/js folder!');
  done();
});

/* copy images into dist/img folder */
gulp.task('copy-images', function(done) {
  gulp.src('img/*.*')
    .pipe(gulp.dest('dist/img'));
  console.log('Images copied into dist/img/ folder!');

  // copy icons  
  gulp.src('img/icons/*.*')
    .pipe(gulp.dest('dist/img/icons'));  
  console.log('Images copied into dist/img/icons folder!');
  
  // copy favicon
  //gulp.src('img/icons/favicon*.*')
  //  .pipe(gulp.dest('./dist/img/icons'));
  console.log('Favicon copied into dist/img/icons folder!');
  done();  
});


gulp.task('lint', function() {
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

gulp.task('copy-manifest', function(done) {
  gulp.src('manifest.json')
    .pipe(gulp.dest('./dist'));
  done(); 
});

gulp.task('default', gulp.series(['styles', 'lint', 'copy-html', 'copy-images', 'scripts-dist', 'copy-manifest'], function(done) {
  gulp.watch('sass/**/*.scss', gulp.series('styles'));
  gulp.watch('js/**/*.js', gulp.series('lint'));
  gulp.watch('/index.html', gulp.series('copy-html'));
  gulp.watch('./manifest.json', gulp.series('copy-manifest'));
  /* list to changes in index.html to aumatically reload the whole page */
  gulp.watch('./dist/index.html').on('change', browserSync.reload);

  browserSync.init({
    server: './dist',
    port: 8000
  });

  done();
}));

/* task to generate all required files for production mode */
gulp.task('dist', gulp.series([
  'copy-html',
  'copy-images',
  'styles',
  'lint',
  'scripts-dist',
  'copy-manifest'
]));
