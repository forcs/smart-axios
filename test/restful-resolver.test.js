const assert = require('chai').assert
import resolveRestfulApi from '../lib/restful-resolver'

describe('test module restful-resolver', function () {
  it('url /user/1234', function () {
    assert.equal(resolveRestfulApi({ url: '/user/:uid', params: { uid: '1234' } }), '/user/1234')
  })
})