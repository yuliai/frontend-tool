const { src, dest, watch, parallel, series } = require('gulp')
const scss = require('gulp-sass')
const removeEmptyLines = require('gulp-remove-empty-lines')
const concat = require('gulp-concat')
const browserSync = require('browser-sync').create()
const uglify = require('gulp-uglify-es').default
const sourcemaps = require('gulp-sourcemaps')
const babel = require('gulp-babel')
const autoprefixer = require('gulp-autoprefixer')
const plumber = require('gulp-plumber')
const del = require('del')
const replace = require('gulp-replace');

/* prod */
function stylesMinified() {
    return src('app/scss/style.scss')
        .pipe(plumber())
        .pipe(scss({outputStyle: 'compressed'})) // scss({outputStyle: 'expanded'})
        .pipe(concat('style.css'))
        .pipe(autoprefixer({
            grid: true
        }))
        .pipe(dest('dist/css'))
}

function scriptsMinified() {
    return src('app/js/main.js')
        .pipe(sourcemaps.init())
        .pipe(babel({
            presets: ['@babel/preset-env']
        }))
        .pipe(concat('main.js'))
        .pipe(uglify())
        .pipe(dest('dist/js'))
}

function copyAssets() {
    return src([
        'app/fonts/**/*',
        'app/images/**/*',
    ], {base: 'app'})
        .pipe(dest('dist'))
}

function htmlBuild() {
    return src('app/index.html')
    .pipe(replace('dev/', ''))
    .pipe(dest('dist'))
}

function stylesExpandedBuild() {
    return src('app/scss/style.scss')
        .pipe(plumber())
        .pipe(scss({outputStyle: 'expanded', includePaths : ['./app/scss/']})) // scss({outputStyle: 'compressed'})
        .pipe(removeEmptyLines())
        .pipe(concat('style.css'))
        .pipe(autoprefixer({
            grid: true
        }))
        .pipe(dest('dist/css'))
}

function scriptsExpandedBuild() {
    return src('app/js/main.js')
        // .pipe(sourcemaps.init())
        .pipe(babel({
            presets: ['@babel/preset-env']
        }))
        .pipe(concat('main.js'))
        .pipe(dest('dist/js'))
}

/* dev */
function stylesExpanded() {
    return src('app/scss/style.scss')
        .pipe(scss({outputStyle: 'expanded'})) // scss({outputStyle: 'compressed'})
        .pipe(removeEmptyLines())
        .pipe(concat('style.css'))
        .pipe(dest('app/dev/css'))
        .pipe(browserSync.stream())
}

function scriptsExpanded() {
    return src([
            'app/js/main.js'
        ])
        .pipe(sourcemaps.init())
        .pipe(babel({
            presets: ['@babel/preset-env']
        }))
        .pipe(concat('main.js'))
        .pipe(dest('app/dev/js'))
        .pipe(browserSync.stream())
}

function watching() {
    watch(['app/scss/**/*.scss'], stylesExpanded)
    watch(['app/js/**/*.js'], scriptsExpanded)
    watch(['app/*.html']).on('change', browserSync.reload)
}

function browsersync() {
    browserSync.init({
        server: {
            baseDir: "app/"
        }
    })
}

function clean() {
    return del(['app/dev/'])
}

function cleanDist() {
    return del(['dist/'])
}

exports.watching = watching
exports.browsersync = browsersync

exports.buildExpanded = series(
    cleanDist, copyAssets, htmlBuild, stylesExpandedBuild, scriptsExpandedBuild
)

exports.buildMinified = series(
    cleanDist, copyAssets, htmlBuild, stylesMinified, scriptsMinified
)

exports.default = series(
    clean, 
    parallel(browsersync, watching, stylesExpanded, scriptsExpanded)
)
