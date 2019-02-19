import Vue from 'vue';
import App from './App.vue';
import router from './router';
import store from './store';
import VueFuse from 'vue-fuse';
import BootstrapVue from 'bootstrap-vue';

Vue.use(VueFuse);
Vue.use(BootstrapVue);

Vue.config.productionTip = false;

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app');
