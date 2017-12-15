const _resolveRestfulApi = function (api) {
  let url
  url = api.url
  if (!url || typeof url !== 'string') {
    throw new Error(`url ${url} is invalid!`)
  }
  const params = api.params
  Object.keys(params).forEach((key) => {
    url = url.replace(new RegExp(`/:${key}`, 'ig'), `/${params[key]}`)
  })
  return url
}

export default _resolveRestfulApi