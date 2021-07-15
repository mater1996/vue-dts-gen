/*
 * @author: Mater
 * @Email: bxh8640@gmail.com
 * @Date: 2021-06-09 11:43:31
 * @Description:
 */
const execa = require('execa')
const rollup = require('rollup')
const config = require('../rollup.config')
const util = require('./utils')

async function build() {
  const watcher = rollup.watch(config)
  console.clear()
  watcher.on('event', async (event) => {
    if (event.code === 'BUNDLE_START') {
      console.log(`${event.input} → ${event.output.join('')}...`)
    }
    if (event.result) {
      event.result.close()
      try {
        await apiExtractor()
      } catch (error) {}
      await util.remove('lib')
    }
  })
}

const apiExtractor = () => {
  return execa('api-extractor', ['run'], { stdout: 'inherit' })
}

async function run() {
  await build()
}

run()
