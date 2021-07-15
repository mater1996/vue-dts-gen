const path = require('path')
const typescript = require('rollup-plugin-typescript2')
const resolve = require('@rollup/plugin-node-resolve').default
const commonjs = require('@rollup/plugin-commonjs')
const alias = require('@rollup/plugin-alias')
const eslint = require('@rollup/plugin-eslint')
const del = require('rollup-plugin-delete')
const terser = require('rollup-plugin-terser').terser

const pkg = require('./package.json')

const resolveRoot = (...args) => path.resolve(__dirname, ...args)
const resolveSrc = (...args) => path.resolve(resolveRoot(), 'src', ...args)
const resolveOutPut = (...args) => path.resolve(resolveRoot(), 'dist', ...args)

const dependencies = Object.keys(pkg.dependencies)
const peerDependencies = Object.keys(pkg.peerDependencies)

module.exports = {
  input: resolveSrc('index.ts'),
  watch: {
    clearScreen: true,
  },
  output: [
    {
      file: resolveOutPut('index.js'),
      format: 'cjs',
      name: "driverBizSdk"
    },
    {
      file: resolveOutPut('index.esm.js'),
      format: 'es',
      name: pkg.name,
    },
  ],
  external: [...dependencies, ...peerDependencies],
  plugins: [
    del({
      targets: ['dist/*', 'lib/*'],
    }),
    eslint({
      throwOnError: true,
      throwOnWarning: true,
    }),
    alias({
      entries: { '@': resolveSrc() },
    }),
    commonjs(),
    resolve(),
    typescript({
      useTsconfigDeclarationDir: true
    }),
  ],
}
