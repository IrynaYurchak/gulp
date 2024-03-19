const gulp = require('gulp');
const pug = require('gulp-pug');
const sass = require('gulp-sass')(require('sass'));
const cssnano = require('gulp-cssnano');
const rename = require('gulp-rename');
const babel = require('gulp-babel');
const uglify = require('gulp-uglify');
const concat = require('gulp-concat');
const browserSync = require('browser-sync').create();
const fs = require('fs').promises;
const path = require('path');

async function deleteDirectory(directoryPath) {
    try {
        await fs.access(directoryPath);
        const files = await fs.readdir(directoryPath);
        for (const file of files) {
            const currentPath = path.join(directoryPath, file);
            const stat = await fs.lstat(currentPath);
            if (stat.isDirectory()) {
                await deleteDirectory(currentPath);
            } else {
                await fs.unlink(currentPath);
            }
        }
        await fs.rmdir(directoryPath);
    } catch (error) {
        if (error.code !== 'ENOENT') {
            console.error(`Error while deleting ${directoryPath}:`, error);
        }
    }
}

// Завдання для очищення папки build
function clean() {
    return deleteDirectory(path.resolve(__dirname, 'build'));
}

// Завдання для обробки Pug файлів
function html() {
    return gulp.src('src/pug/**/*.pug')
        .pipe(pug({ pretty: true }))
        .pipe(gulp.dest('build'));
}

// Завдання для компіляції Sass у CSS
function styles() {
    return gulp.src('src/styles/**/*.scss')
        .pipe(sass().on('error', sass.logError))
        .pipe(cssnano())
        .pipe(rename({ suffix: '.min' }))
        .pipe(gulp.dest('build/css'));
}

// Завдання для обробки JavaScript
function scripts() {
    return gulp.src('src/scripts/**/*.js')
        .pipe(babel({
            presets: ['@babel/env']
        }))
        .pipe(uglify())
        .pipe(concat('main.min.js'))
        .pipe(gulp.dest('build/js'));
}

// Завдання для копіювання зображень
function images() {
    return gulp.src('src/images/**/*')
        .pipe(gulp.dest('build/images'));
}

// Відстеження змін у файлах
function watchFiles() {
    gulp.watch('src/pug/**/*.pug', html);
    gulp.watch('src/styles/**/*.scss', styles);
    gulp.watch('src/scripts/**/*.js', scripts);
    gulp.watch('src/images/**/*', images);
}

// Локальний сервер для розробки
function serve() {
    browserSync.init({
        server: {
            baseDir: './build'
        }
    });
    gulp.watch('build/**/*').on('change', browserSync.reload);
}

const build = gulp.series(clean, gulp.parallel(html, styles, scripts, images));
exports.default = gulp.series(build, gulp.parallel(watchFiles, serve));




