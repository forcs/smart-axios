import 'babel-polyfill'

const utils = require('../lib/utils.js')
const assert = require('chai').assert

describe('test module utils', function () {
  describe('test utils.isFunc()', function () {
    it('utils.isFunc(function) should return true', function () {
      const t = function () {}
      assert.equal(utils.isFunc(t), true)
    })
  })

  describe('test utils.isArray()', function () {
    it('utils.isArray(array) should return true', function () {
      const t = function () {}
      assert.equal(utils.isArray(t), false)
      assert.equal(utils.isArray([]), true)
      assert.equal(utils.isArray({}), false)
    })
  })

  describe('test utils.isObject()', function () {
    it('utils.isArray(array) should return true', function () {
      const t = function () {}
      assert.equal(utils.isObject(t), false)
      assert.equal(utils.isObject([]), false)
      assert.equal(utils.isObject({}), true)
    })
  })
})