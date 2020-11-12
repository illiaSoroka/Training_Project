let gulp = require('gulp'),
	sass = require('gulp-sass'),
	browserSync = require('browser-sync'),
	uglify = require('gulp-uglify'),
	rename = require('gulp-rename'),
	del = require('del'),
	autoprefixer = require('gulp-autoprefixer'),
	pug = require('gulp-pug'),
	rsync = require('gulp-rsync'),
	watch = require('gulp-watch'),
	concat = require('gulp-concat');

gulp.task('clean', async function () {
	del.sync('dist')
})

gulp.task('html', function () {
	return gulp.src('app/*.html')
		.pipe(browserSync.reload({ stream: true }));
});

gulp.task('pug', function () {
	return gulp.src('app/pug/index.pug')
		.pipe(pug({
			pretty: true
		}))
		.pipe(gulp.dest('app'))
		.pipe(browserSync.reload({ stream: true }));
})

gulp.task('css', function () {
	return gulp
		.src([
			'node_modules/normalize.css/normalize.css',
			//'node_modules/magnific-popup/dist/magnific-popup.css',
			//'node_modules/slick-carousel/slick/slick.css',
		])
		.pipe(concat('_libs.scss'))
		.pipe(gulp.dest('app/sass'))
		.pipe(browserSync.reload({ stream: true }));
});

gulp.task('script', function () {
	return gulp.src('app/js/*.js')
		.pipe(browserSync.reload({ stream: true }));
});

var syntax = 'sass'; // Syntax: sass or scss;
gulp.task('styles', function () {
	return gulp
		.src('app/' + syntax + '/**/**/*.' + syntax + '')
		.pipe(sass({ outputStyle: 'compressed' }))
		.pipe(autoprefixer({
			browsers: ['last 8 versions']
		}))
		.pipe(rename({ suffix: '.min', prefix: '' }))
		.pipe(gulp.dest('app/css'))
		.pipe(browserSync.reload({ stream: true }));
});

gulp.task('js', function () {
	return gulp
		.src([
			// 'node_modules/slick-carousel/slick/slick.js',
			'node_modules/jquery/dist/jquery.min.js',
			//'node_modules/magnific-popup/dist/jquery.magnific-popup.js',
			'app/js/common.js' // Always at the end
		])
		.pipe(concat('scripts.min.js'))
		.pipe(uglify())
		.pipe(gulp.dest('app/js'))
		.pipe(browserSync.reload({ stream: true }));
});

gulp.task('browser-sync', function () {
	browserSync.init({
		server: {
			baseDir: 'app/',
		},
	});
});

gulp.task('rsync', function () {
	return gulp.src('app/**')
		.pipe(rsync({
			root: 'app/',
			hostname: 'username@yousite.com',
			destination: 'yousite/public_html/',
			// include: ['*.htaccess'], // Includes files to deploy
			exclude: ['**/Thumbs.db', '**/*.DS_Store'], // Excludes files from deploy
			recursive: true,
			archive: true,
			silent: false,
			compress: true
		}))
});

gulp.task('export', async function () {
	let buildHtml = gulp.src('app/**/*.html')
		.pipe(gulp.dest('dist'));

	let buildCss = gulp.src('app/css/**/*.css')
		.pipe(gulp.dest('dist/css'));

	let buildJs = gulp.src('app/js/**/*.js')
		.pipe(gulp.dest('dist/js'));

	let buildFonts = gulp.src('app/fonts/**/*.*')
		.pipe(gulp.dest('dist/fonts'));

	let buildImg = gulp.src('app/img/**/*.*')
		.pipe(gulp.dest('dist/img'));
});

gulp.task('watch', function () {
	gulp.watch('app/**/**/*.' + syntax + '', gulp.parallel('styles'));
	gulp.watch('app/**/**/*.pug', gulp.parallel('pug'));
	gulp.watch('app/**/common.js', gulp.parallel('js'));
});

gulp.task('build', gulp.series('clean', 'export'));

gulp.task(
	'default',
	gulp.parallel('pug', 'css', 'styles', 'js', 'browser-sync', 'watch')
);