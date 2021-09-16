import Vue from 'vue'
import Vuex from 'vuex'

/* Vuex */
import template from '@/store/template.js'
import user from '@/store/user.js'
import loader from '@/store/loader.js'
import info from '@/store/info.js'

Vue.use(Vuex)

export default new Vuex.Store({
    modules: {template, user, loader, info}
})