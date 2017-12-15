const assert = require('chai').assert
const should = require('chai').should()
import merge from '../lib/options-merger'

describe('test module options-merger', function () {
  it('merge', function () {
    var merged = merge({ url: 'user', params: { uid: '1234' } }, { a: 1 })
    merged.should.have.property('a').with.equal(1)
  })
})