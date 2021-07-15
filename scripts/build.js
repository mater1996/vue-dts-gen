/*
 * @author: Mater
 * @Email: bxh8640@gmail.com
 * @Date: 2021-06-09 11:43:07
 * @Description:
 */
const execa = require('execa')
const util = require('./utils')

async function build() {
  await rollup()
  try {
    await apiExtractor()
  } catch (error) {}
  await util.remove('lib')
}

const rollup = (options = []) => {
  return execa(
    'rollup',
    ['-c', './rollup.config.js', '--environment', options.join(',')],
    { stdio: 'inherit' }
  )
}

const apiExtractor = (options = []) => {
  return execa('api-extractor', ['run'], { stdout: 'inherit' })
}

async function run() {
  await build()
}

run()
