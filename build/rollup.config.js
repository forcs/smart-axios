const path = require('path')
const resolve = require('rollup-plugin-node-resolve')
const commonjs = require('rollup-plugin-commonjs')
const babel = require('rollup-plugin-babel')
const uglify = require('rollup-plugin-uglify')

let name = 'smart-axios'
if (process.env.NODE_ENV === 'production') {
  name += '.min'
}
module.exports = {
  input: path.resolve(__dirname, '../src/index.js'),
  output: {
    file: path.resolve(__dirname, '../dist/' + name + '.js'),
    format: 'umd',
    name: '$axios',
    sourcemap: true,
    sourcemapFile: path.resolve(__dirname, '../dist/' + name + '.js.map'),
    globals: {
      axios: 'axios'
    }
  },
  external: [ 'axios' ],
  plugins: [
    resolve(),
    commonjs(),
    babel({
      exclude: 'node_modules/**'
    }),
    (process.env.NODE_ENV === 'production' && uglify())
  ]
}