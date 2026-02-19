import Vue from 'vue'
import App from './App.vue'
import './registerServiceWorker'
import AppButton from '@/components/UI/AppButton.vue';
import router from './router';

Vue.component('Button', AppButton);

Vue.config.productionTip = false

new Vue({
  router,
  render: h => h(App),
}).$mount('#app')
