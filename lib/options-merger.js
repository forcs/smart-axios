import { isArray, isObject } from './utils'

const _mergeDeep = function (target, source) {
  Object.keys(source).forEach(key => {
    const value = source[key]
    if (isArray(value)) {
      if (!target[key]) {
        target[key] = []
      }
      target[key].concat(value)
    } else if (isObject(value)) {
      if (!target[key]) {
        target[key] = {}
      }
      _mergeDeep(target[key], value)
    } else {
      target[key] = value
    }
  })
  return target
}
const _mergeOptions = function (target, source) {
  let res = {}
  if (!source || !Object.keys(source).length) {
    res = target || {}
  } else {
    res = _mergeDeep(target || {}, source)
  }
  return res
}

export default _mergeOptions