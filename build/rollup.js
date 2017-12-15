const path = require('path')
const rollup = require('rollup')
const config = require('./rollup.config')
const rm = require('rimraf')
const ora = require('ora')
const chalk = require('chalk')

const spinner = ora('正在打包...')
spinner.start()

const target = path.resolve(__dirname, '../dist')
rm(target, function (err) {
  if (err) {
    spinner.fail(err.message)
    console.error(err)
    return
  }

  rollup.rollup(config).then(bundle => {
    return bundle.write(config.output)
  }).then(stat => {
    spinner.succeed('打包成功! @' + target)
  }).catch(err => {
    spinner.fail(err.message)
    console.error(err)
  })
})
