'use strict'

const gulp = require('gulp')
const eslint = require('gulp-eslint')
const chalk = require('chalk')
const mocha = require('gulp-mocha')

gulp.task('lint', () => {
  console.log(chalk.bold('\n任务'), chalk.green.bold('lint'), ': 代码检查。\n')
  return gulp.src(['../**/*.js', '!../node_modules/**', '!./*.js'])
    .pipe(eslint({ fix: true }))
    .pipe(eslint.format())
    .pipe(eslint.failAfterError())
})

gulp.task('test', () => {
  console.log(chalk.bold('\n任务'), chalk.green.bold('test'), ': 测试。\n')
  return gulp.src('./test.js', { read: false }).pipe(mocha())
})

gulp.task('default', ['lint', 'test'], () => console.log(chalk.green.bold('\n流程完成。\n')))