var gulp = require('gulp'),
  sass = require('gulp-ruby-sass'),
  watch = require('gulp-watch'),
  connect = require('gulp-connect'),
  rename = require('gulp-rename'),
  coffee = require('gulp-coffee'),
  shell = require('gulp-shell'),
  minifyCSS = require('gulp-minify-css'),
  uglify = require('gulp-uglify'),
  options = require('./env'),
  jade = require('gulp-jade'),
  insert = require('gulp-insert'),
  sourcemaps = require('gulp-sourcemaps');

// Main entry point
gulp.task('default', ['build', 'watch', 'connect']);

// Basic builder
gulp.task('build', ['compile:jade', 'compile:coffee', 'compile:sass', 'copy']);

// Static assets
gulp.task('copy', function() {
  gulp.src(['./lib/img/**/*'])
    .pipe(shell([
      'mkdir -p ./public/img'
    ]))
    .pipe(gulp.dest('./public/img'));
  
  gulp.src(['./lib/**/*.ico'])
    .pipe(gulp.dest('./public'));

  gulp.src(['./lib/sitemap.xml'])
    .pipe(gulp.dest('./public'));
})

// Compilers
gulp.task('compile:sass', function() {
  gulp.src(['./lib/sass/**/*.{sass, scss}'])
    .pipe(sass())
    // .pipe(minifyCSS())
    .pipe(gulp.dest('./public/css'));
});

gulp.task('compile:coffee', function() {

  if (options.env != "dev") {
    gulp.src(['./lib/coffee/**/*.coffee'])
      .pipe(insert.prepend("env = '" + options.env + "'\n"))
      .pipe(coffee({
        bare: false
      }))
      .pipe(uglify())
      .pipe(gulp.dest('./public/js'));

    // Special case for the node index.js file
    gulp.src(['./index.coffee'])
      .pipe(insert.prepend("env = '" + options.env + "'\n"))
      .pipe(coffee({
        bare: true
      }))
      .pipe(uglify())
      .pipe(gulp.dest('./'));

  }
  
  // Don't minify
  else {
    gulp.src(['./lib/coffee/**/*.coffee'])
      .pipe(insert.prepend("env = '" + options.env + "'\n"))
      .pipe(coffee({
        bare: true
      }))
      .pipe(gulp.dest('./public/js'));

    // Special case for the node index.js file
    gulp.src(['./index.coffee'])
      .pipe(insert.prepend("env = '" + options.env + "'\n"))
      .pipe(coffee({
        bare: true
      }))
      .pipe(gulp.dest('./')); 

    // Special case for testing
    gulp.src(['./tests/test.coffee'])
      .pipe(coffee())
      .pipe(gulp.dest('./tests'));

  }

});

gulp.task('compile:jade', function() {
    gulp.src(['./lib/jade/**/*.jade'])
      .pipe(jade({
        locals: options
      }))
      .pipe(gulp.dest('./public/'));
});

gulp.task('connect', function() {
  connect.server({
    livereload: true,
    port: options.port,
    root: 'public'
  });
});

gulp.task('watch' , function() {
  gulp.watch(['./lib/sass/**/*.{sass, scss}'], ["compile:sass"]);
  gulp.watch(['./lib/jade/**/*.jade'], ["compile:jade"]);
  gulp.watch(['./lib/coffee/**/*.coffee'], ["compile:coffee"]);
});
