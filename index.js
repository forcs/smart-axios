const $axios = require('./src/index')

$axios({
  urls: {
    getUser: '/user/:uid',
    loadUser: '/user/:uid',
    fetchUser: '/user/:uid',
    headUser: '/user/:uid',
    optionUser: '/user/:uid/:role',
    createUser: '/user/:platform'
  }
}).fork({
  urls: {
    'islogin': {
      path: '/auth/islogin',
      method: 'pos'
    }
  }
}).islogin()
