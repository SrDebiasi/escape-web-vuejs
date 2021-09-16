import Vue from 'vue'

import './classes'
import './plugins/axios' /* axios */
import './plugins/toast' /* toast */
import './plugins/loader' /* loader */
import './plugins/vmask' /* vmask */
import './filters/filters.js'/* filters */


/* Vuetify */
import vuetify from "@/plugins/vuetify"

/* i18n */
import i18n from '@/plugins/i18n'

/* Router */
import router from '@/routes'

/* money */
import '@/plugins/money'

/* Vuelidate */
import '@/plugins/vuelidate'

/* App */
import App from '@/App.vue'

/* Vuex/Store */
import store from '@/store'

//Some issue to use var
const ignoreWarnMessage = 'The .native modifier for v-on is only valid on components but it was used on <div>.';
// eslint-disable-next-line no-unused-vars
Vue.config.warnHandler = function (msg, vm, trace) {
    // `trace` is the component hierarchy trace
    if (msg === ignoreWarnMessage) {
        msg = null;
        vm = null;
        trace = null;
    }
}

new Vue({
    store,
    i18n,
    vuetify,
    router,
    render: h => h(App),
}).$mount('#app');


