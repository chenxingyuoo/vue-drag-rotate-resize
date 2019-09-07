import Vue from 'vue'
import App from './App.vue'
import VueDragRotateResize from '../src/index'
Vue.use(VueDragRotateResize)

Vue.config.productionTip = false

new Vue({
  render: h => h(App)
}).$mount('#app')
