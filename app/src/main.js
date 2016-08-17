import Vue from 'vue'
import Electron from 'vue-electron'
import Resource from 'vue-resource'
import Router from 'vue-router'

import App from './App'
import routes from './routes'

var _ = require('lodash')

Vue.use(Electron)
Vue.use(Resource)
Vue.use(Router)
Vue.use({
  install: Vue => {
    Vue.prototype._ = _
  }
})
Vue.config.debug = true

const router = new Router()

router.map(routes)
router.beforeEach(() => {
  window.scrollTo(0, 0)
})
router.redirect({
  '*': '/'
})

router.start(App, 'app')
