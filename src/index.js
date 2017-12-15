import axios from 'axios'
import { stringify } from 'query-string'

import resolveRestfulApi from '../lib/restful-resolver'
import { isFunc, isObject } from '../lib/utils'
import merge from '../lib/options-merger'

const _resOk = function (response, resolveFunc, callbackFunc, thisArg) {
  if (isFunc(callbackFunc)) {
    callbackFunc.call(thisArg, undefined, response)
  }
  if (isFunc(resolveFunc)) {
    resolveFunc(response)
  }
}

const _resError = function (error, rejectFunc, callbackFunc, thisArg) {
  if (isFunc(callbackFunc)) {
    callbackFunc.call(thisArg, error)
  }
  if (isFunc(rejectFunc)) {
    rejectFunc(error)
  }
}

const _resolveQueryMethod= function (methodName, context) {
  return function (api, queries, callback, thisArg) {
    if (isFunc(queries)) {
      thisArg = callback
      callback = queries
      queries = undefined
    }
    thisArg = thisArg || context
    return new Promise(function (resolve, reject) {
      var _q = []
      if (queries) {
        _q = Object.keys(queries).map(key => `${key}=${queries[key]}`)
      }
      var url = _q.length > 0 ? `${api}?${_q.join('&')}` : api
      context[methodName].call(context, url).then((response) => {
        _resOk(response, resolve, callback, thisArg)
      }).catch((error) => {
        _resError(error, reject, callback, thisArg)
      })
    })
  }
}

const _resolveDataMethod = function (methodName, context) {
  return function (api, data, callback, thisArg) {
    if (isFunc(data)) {
      thisArg = callback
      callback = data
      data = undefined
    }
    thisArg = thisArg || context
    return new Promise((resolve, reject) => {
      context[methodName].call(context, api, data ? stringify(data) : undefined)
      .then((response) => {
        _resOk(response, resolve, callback, thisArg)
      }).catch((error) => {
        _resError(error, reject, callback, thisArg)
      })
    })
  }
}

const SmartAxios = function(options) {
  options = options || {}
  this._opt = merge({}, options)
  const _raw = this.raw = axios.create(this._opt)

  for (let key in _raw) {
    if (isFunc(_raw[key])) {
      (function (ctx, k, ax) {
        ctx[k] = function () {
          return ax[k].apply(ax, Array.prototype.slice.call(arguments))
        }
      })(this, key, _raw)
    }
  }

  if (this._opt.urls) {
    const POST_METHOD_RE = /^(add|create|new|post)\w+$/
    const DELETE_METHOD_RE = /^(delete|remove)\w+$/
    const PUT_METHOD_RE = /^(edit|update|modify|put)\w+$/
    const GET_METHOD_RE = /^(get|load|fetch|query)\w+$/
    const PATCH_METHOD_RE = /^(patch)\w+$/    
    const OPTIONS_METHOD_RE = /^(options)\w+$/
    const HEAD_METHOD_RE = /^(head)\w+$/
    const urlConfigs = this._opt.urls
    const that = this

    Object.keys(urlConfigs).forEach(apiName => {
      const urlConf = urlConfigs[apiName]
      let path = undefined
      let method = undefined
      if (typeof urlConf === 'string') {
        path = urlConf
        method = undefined
      } else if (isObject(urlConf)) {
        path = urlConf['path']
        method = urlConf['method']
        if (method) {
          method = method.toLowerCase()
        }
      }

      if (!path) {
        console.error(`${apiName}()的接口地址无效`)
        console.log()
        return
      }

      if (!method) {
        if (POST_METHOD_RE.test(apiName)) {
          method = _resolveDataMethod('post', that)
        } else if (DELETE_METHOD_RE.test(apiName)) {
          method = _resolveQueryMethod('delete', that)
        } else if (PUT_METHOD_RE.test(apiName)) {
          method = _resolveDataMethod('put', that)
        } else if (GET_METHOD_RE.test(apiName)) {
          method = _resolveQueryMethod('get', that)
        } else if (PATCH_METHOD_RE.test(apiName)) {
          method = _resolveDataMethod('patch', that)
        } else if (OPTIONS_METHOD_RE.test(apiName)) {
          method = _resolveQueryMethod('options', that)
        } else if (HEAD_METHOD_RE.test(apiName)) {
          method = _resolveQueryMethod('head', that)
        } else {

          console.error(`方法名: ${apiName} 不符合命名规则`)
          console.log()
          console.info('Tips:')
          console.info('GET\t=> get|load|fetch|query')
          console.info('POST\t=> add|create|new|post')
          console.info('PUT\t=> edit|update|modify|put')
          console.info('DELETE\t=> delete|remove')
          console.info('PATCH\t=> patch')
          console.info('OPTIONS\t=> options')
          console.info('HEAD\t=> head')
          console.log()

          return
        }
      } else {
        if (/(post|put|patch)/.test(method)) {
          method = _resolveDataMethod(method, that)
        } else if (/(delete|get|options|head)/.test(method)) {
          method = _resolveQueryMethod(method, that)
        } else {

          console.error(`未知的请求方法: ${method}, ${apiName}()无法正常生产方法`)
          console.log()

          return
        }
      }

      that[apiName] = function () {
        let args = Array.prototype.slice.call(arguments)
        let _url = path
        if (args.length > 0 && path.indexOf('/:') >= 0) {
          if (isObject(args[0])) {
            const params = args[0]
            args = args.filter((item, index) => index > 0)
            _url = resolveRestfulApi({ url: path, params })
          }
        }
        return method.apply(that, [ _url ].concat(args))
      }
    })
  }
}

SmartAxios.prototype.branch = function (options) {
  return new SmartAxios(merge(merge({}, this._opt), options))
}

module.exports = function (options) {
  return new SmartAxios(options)
}