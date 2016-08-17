import Vue from 'vue'

export default {
  '/': {
    component: Vue.component('default', require('./components/Default')),
    name: 'default'
  }
}
