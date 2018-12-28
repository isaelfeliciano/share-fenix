import axios from 'axios'
import Vue from 'vue'
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'

import App from './App.vue'
import router from './router'
import store from './store'

const log = require('simple-node-logger').createSimpleLogger('share-fenix.log')
const upath = require('upath')

log.setLevel('debug')
var gui = require('nw.gui')
var {Registry} = require('rage-edit')
var win = nw.Window.get()
log.debug(gui.App.argv[0])

win.on('open', (argv) => {
	filePath = argv[0]
	log.debug(argv)
})


Vue.mixin({
	data: function () {
		return {
			filePath: '',
			fullPath: ''
		}
	},
	methods: {
	},
	created () {
	}
})

Vue.use(ElementUI)
Vue.http = Vue.prototype.$http = axios
Vue.config.productionTip = false
// Vue.prototype.$message = Message


new Vue({
  el: '#app',
  router,
  store,
  render: h => h(App)
})

/*new Vue({
    el: '#app',
    router,
    store,
    template: '<App/>',
    components: { App }
  }).$mount()*/