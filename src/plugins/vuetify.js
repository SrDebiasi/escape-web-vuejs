import Vue     from 'vue'
import Vuetify from "vuetify";
import i18n    from '@/plugins/i18n'

import 'vuetify/dist/vuetify.min.css'
import '@mdi/font/css/materialdesignicons.css'
import '@/assets/styles/index.css'


Vue.use(Vuetify);


export default new Vuetify({
  icons: {
    iconfont: 'mdi',
  },
  theme: {
    dark  : true,
    themes: {
      dark: {
        primary  : '#5f5f5f',
        secondary: '#b0bec5',
        accent   : '#8c9eff',
        error    : '#b71c1c',
        success  : '#266d29',
      },
    },
  },
  lang : {
    locales: ["en", "pt"],
    t      : (key, ...params) => i18n.t(key, params),
    current: 'en',
  },
});


