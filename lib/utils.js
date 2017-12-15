const _isFunc = function (o) {
  return o && typeof o === 'function'
}

const _isArray = function (o) {
  return o && Object.prototype.toString.call(o) === '[object Array]'
}

const _isObject = function (o) {
  return o && Object.prototype.toString.call(o) === '[object Object]'
}

export { _isFunc as isFunc }
export { _isArray as isArray }
export { _isObject as isObject }

export default {
  isFunc: _isFunc,
  isArray: _isArray,
  isObject: _isObject
}