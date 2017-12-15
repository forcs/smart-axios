(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(require('axios')) :
	typeof define === 'function' && define.amd ? define(['axios'], factory) :
	(factory(global.axios));
}(this, (function (axios) { 'use strict';

axios = axios && axios.hasOwnProperty('default') ? axios['default'] : axios;

var strictUriEncode = function (str) {
	return encodeURIComponent(str).replace(/[!'()*]/g, function (c) {
		return '%' + c.charCodeAt(0).toString(16).toUpperCase();
	});
};

/*
object-assign
(c) Sindre Sorhus
@license MIT
*/

/* eslint-disable no-unused-vars */
var getOwnPropertySymbols = Object.getOwnPropertySymbols;
var hasOwnProperty = Object.prototype.hasOwnProperty;
var propIsEnumerable = Object.prototype.propertyIsEnumerable;

function toObject(val) {
	if (val === null || val === undefined) {
		throw new TypeError('Object.assign cannot be called with null or undefined');
	}

	return Object(val);
}

function shouldUseNative() {
	try {
		if (!Object.assign) {
			return false;
		}

		// Detect buggy property enumeration order in older V8 versions.

		// https://bugs.chromium.org/p/v8/issues/detail?id=4118
		var test1 = new String('abc');  // eslint-disable-line no-new-wrappers
		test1[5] = 'de';
		if (Object.getOwnPropertyNames(test1)[0] === '5') {
			return false;
		}

		// https://bugs.chromium.org/p/v8/issues/detail?id=3056
		var test2 = {};
		for (var i = 0; i < 10; i++) {
			test2['_' + String.fromCharCode(i)] = i;
		}
		var order2 = Object.getOwnPropertyNames(test2).map(function (n) {
			return test2[n];
		});
		if (order2.join('') !== '0123456789') {
			return false;
		}

		// https://bugs.chromium.org/p/v8/issues/detail?id=3056
		var test3 = {};
		'abcdefghijklmnopqrst'.split('').forEach(function (letter) {
			test3[letter] = letter;
		});
		if (Object.keys(Object.assign({}, test3)).join('') !==
				'abcdefghijklmnopqrst') {
			return false;
		}

		return true;
	} catch (err) {
		// We don't expect any of the above to throw, but better to be safe.
		return false;
	}
}

var objectAssign = shouldUseNative() ? Object.assign : function (target, source) {
	var from;
	var to = toObject(target);
	var symbols;

	for (var s = 1; s < arguments.length; s++) {
		from = Object(arguments[s]);

		for (var key in from) {
			if (hasOwnProperty.call(from, key)) {
				to[key] = from[key];
			}
		}

		if (getOwnPropertySymbols) {
			symbols = getOwnPropertySymbols(from);
			for (var i = 0; i < symbols.length; i++) {
				if (propIsEnumerable.call(from, symbols[i])) {
					to[symbols[i]] = from[symbols[i]];
				}
			}
		}
	}

	return to;
};

function encoderForArrayFormat(opts) {
	switch (opts.arrayFormat) {
		case 'index':
			return function (key, value, index) {
				return value === null ? [
					encode(key, opts),
					'[',
					index,
					']'
				].join('') : [
					encode(key, opts),
					'[',
					encode(index, opts),
					']=',
					encode(value, opts)
				].join('');
			};

		case 'bracket':
			return function (key, value) {
				return value === null ? encode(key, opts) : [
					encode(key, opts),
					'[]=',
					encode(value, opts)
				].join('');
			};

		default:
			return function (key, value) {
				return value === null ? encode(key, opts) : [
					encode(key, opts),
					'=',
					encode(value, opts)
				].join('');
			};
	}
}

function encode(value, opts) {
	if (opts.encode) {
		return opts.strict ? strictUriEncode(value) : encodeURIComponent(value);
	}

	return value;
}

var stringify = function (obj, opts) {
	var defaults = {
		encode: true,
		strict: true,
		arrayFormat: 'none'
	};

	opts = objectAssign(defaults, opts);

	var formatter = encoderForArrayFormat(opts);

	return obj ? Object.keys(obj).sort().map(function (key) {
		var val = obj[key];

		if (val === undefined) {
			return '';
		}

		if (val === null) {
			return encode(key, opts);
		}

		if (Array.isArray(val)) {
			var result = [];

			val.slice().forEach(function (val2) {
				if (val2 === undefined) {
					return;
				}

				result.push(formatter(key, val2, result.length));
			});

			return result.join('&');
		}

		return encode(key, opts) + '=' + encode(val, opts);
	}).filter(function (x) {
		return x.length > 0;
	}).join('&') : '';
};

var _resolveRestfulApi = function _resolveRestfulApi(api) {
  var url = void 0;
  url = api.url;
  if (!url || typeof url !== 'string') {
    throw new Error('url ' + url + ' is invalid!');
  }
  var params = api.params;
  Object.keys(params).forEach(function (key) {
    url = url.replace(new RegExp('/:' + key, 'ig'), '/' + params[key]);
  });
  return url;
};

var _isFunc = function _isFunc(o) {
  return o && typeof o === 'function';
};

var _isArray = function _isArray(o) {
  return o && Object.prototype.toString.call(o) === '[object Array]';
};

var _isObject = function _isObject(o) {
  return o && Object.prototype.toString.call(o) === '[object Object]';
};

var _mergeDeep = function _mergeDeep(target, source) {
  Object.keys(source).forEach(function (key) {
    var value = source[key];
    if (_isArray(value)) {
      if (!target[key]) {
        target[key] = [];
      }
      target[key].concat(value);
    } else if (_isObject(value)) {
      if (!target[key]) {
        target[key] = {};
      }
      _mergeDeep(target[key], value);
    } else {
      target[key] = value;
    }
  });
  return target;
};
var _mergeOptions = function _mergeOptions(target, source) {
  var res = {};
  if (!source || !Object.keys(source).length) {
    res = target || {};
  } else {
    res = _mergeDeep(target || {}, source);
  }
  return res;
};

var _resOk = function _resOk(response, resolveFunc, callbackFunc, thisArg) {
  if (_isFunc(callbackFunc)) {
    callbackFunc.call(thisArg, undefined, response);
  }
  if (_isFunc(resolveFunc)) {
    resolveFunc(response);
  }
};

var _resError = function _resError(error, rejectFunc, callbackFunc, thisArg) {
  if (_isFunc(callbackFunc)) {
    callbackFunc.call(thisArg, error);
  }
  if (_isFunc(rejectFunc)) {
    rejectFunc(error);
  }
};

var _resolveQueryMethod = function _resolveQueryMethod(methodName, context) {
  return function (api, queries, callback, thisArg) {
    if (_isFunc(queries)) {
      thisArg = callback;
      callback = queries;
      queries = undefined;
    }
    thisArg = thisArg || context;
    return new Promise(function (resolve, reject) {
      var _q = [];
      if (queries) {
        _q = Object.keys(queries).map(function (key) {
          return key + '=' + queries[key];
        });
      }
      var url = _q.length > 0 ? api + '?' + _q.join('&') : api;
      context[methodName].call(context, url).then(function (response) {
        _resOk(response, resolve, callback, thisArg);
      }).catch(function (error) {
        _resError(error, reject, callback, thisArg);
      });
    });
  };
};

var _resolveDataMethod = function _resolveDataMethod(methodName, context) {
  return function (api, data, callback, thisArg) {
    if (_isFunc(data)) {
      thisArg = callback;
      callback = data;
      data = undefined;
    }
    thisArg = thisArg || context;
    return new Promise(function (resolve, reject) {
      context[methodName].call(context, api, data ? stringify(data) : undefined).then(function (response) {
        _resOk(response, resolve, callback, thisArg);
      }).catch(function (error) {
        _resError(error, reject, callback, thisArg);
      });
    });
  };
};

var SmartAxios = function SmartAxios(options) {
  options = options || {};
  this._opt = _mergeOptions({}, options);
  var _raw = this.raw = axios.create(this._opt);

  for (var key in _raw) {
    if (_isFunc(_raw[key])) {
      (function (ctx, k, ax) {
        ctx[k] = function () {
          return ax[k].apply(ax, Array.prototype.slice.call(arguments));
        };
      })(this, key, _raw);
    }
  }

  if (this._opt.urls) {
    var POST_METHOD_RE = /^(add|create|new|post)\w+$/;
    var DELETE_METHOD_RE = /^(delete|remove)\w+$/;
    var PUT_METHOD_RE = /^(edit|update|modify|put)\w+$/;
    var GET_METHOD_RE = /^(get|load|fetch|query)\w+$/;
    var PATCH_METHOD_RE = /^(patch)\w+$/;
    var OPTIONS_METHOD_RE = /^(options)\w+$/;
    var HEAD_METHOD_RE = /^(head)\w+$/;
    var urlConfigs = this._opt.urls;
    var that = this;

    Object.keys(urlConfigs).forEach(function (apiName) {
      var urlConf = urlConfigs[apiName];
      var path = undefined;
      var method = undefined;
      if (typeof urlConf === 'string') {
        path = urlConf;
        method = undefined;
      } else if (_isObject(urlConf)) {
        path = urlConf['path'];
        method = urlConf['method'];
        if (method) {
          method = method.toLowerCase();
        }
      }

      if (!path) {
        console.error(apiName + '()\u7684\u63A5\u53E3\u5730\u5740\u65E0\u6548');
        console.log();
        return;
      }

      if (!method) {
        if (POST_METHOD_RE.test(apiName)) {
          method = _resolveDataMethod('post', that);
        } else if (DELETE_METHOD_RE.test(apiName)) {
          method = _resolveQueryMethod('delete', that);
        } else if (PUT_METHOD_RE.test(apiName)) {
          method = _resolveDataMethod('put', that);
        } else if (GET_METHOD_RE.test(apiName)) {
          method = _resolveQueryMethod('get', that);
        } else if (PATCH_METHOD_RE.test(apiName)) {
          method = _resolveDataMethod('patch', that);
        } else if (OPTIONS_METHOD_RE.test(apiName)) {
          method = _resolveQueryMethod('options', that);
        } else if (HEAD_METHOD_RE.test(apiName)) {
          method = _resolveQueryMethod('head', that);
        } else {

          console.error('\u65B9\u6CD5\u540D: ' + apiName + ' \u4E0D\u7B26\u5408\u547D\u540D\u89C4\u5219');
          console.log();
          console.info('Tips:');
          console.info('GET\t=> get|load|fetch|query');
          console.info('POST\t=> add|create|new|post');
          console.info('PUT\t=> edit|update|modify|put');
          console.info('DELETE\t=> delete|remove');
          console.info('PATCH\t=> patch');
          console.info('OPTIONS\t=> options');
          console.info('HEAD\t=> head');
          console.log();

          return;
        }
      } else {
        if (/(post|put|patch)/.test(method)) {
          method = _resolveDataMethod(method, that);
        } else if (/(delete|get|options|head)/.test(method)) {
          method = _resolveQueryMethod(method, that);
        } else {

          console.error('\u672A\u77E5\u7684\u8BF7\u6C42\u65B9\u6CD5: ' + method + ', ' + apiName + '()\u65E0\u6CD5\u6B63\u5E38\u751F\u4EA7\u65B9\u6CD5');
          console.log();

          return;
        }
      }

      that[apiName] = function () {
        var args = Array.prototype.slice.call(arguments);
        var _url = path;
        if (args.length > 0 && path.indexOf('/:') >= 0) {
          if (_isObject(args[0])) {
            var params = args[0];
            args = args.filter(function (item, index) {
              return index > 0;
            });
            _url = _resolveRestfulApi({ url: path, params: params });
          }
        }
        return method.apply(that, [_url].concat(args));
      };
    });
  }
};

SmartAxios.prototype.branch = function (options) {
  return new SmartAxios(_mergeOptions(_mergeOptions({}, this._opt), options));
};

module.exports = function (options) {
  return new SmartAxios(options);
};

})));
//# sourceMappingURL=smart-axios.js.map
