#!/usr/bin/env node
const { cac } = require('cac')
const cli = cac('vue-dts-gen')
const pkg = require('../package.json')

cli
  .command('[...vue files]', 'Generate .d.ts for .vue files')
  .action(async () => {
    const { build } = require('../dist/index.js')
    await build()
  })

cli.version(pkg.version)
cli.help()
cli.parse()
