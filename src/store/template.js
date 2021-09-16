import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default ({
    state: {
        barColor: 'rgba(0, 0, 0, .7), rgba(0, 0, 0, .7)',
        barImage: '',//require('../assets/bar-image.jpg'),
        drawer: true,
    },

    getters: {
        getDrawer(state) {
            return state.drawer;
        },
        getBarImage(state) {
            return state.barImage;
        },
        getBarColor(state) {
            return state.barColor;
        }
    },

    mutations: {
        SET_BAR_IMAGE(state, payload) {
            state.barImage = payload
        },
        SET_DRAWER(state, payload) {
            state.drawer = payload
        },
    },
    actions: {},
})