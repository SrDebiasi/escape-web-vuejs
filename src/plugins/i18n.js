import Vue from 'vue'
import VueI18n from 'vue-i18n'
import store from "@/store";

Vue.use(VueI18n)

import en from 'vuetify/src/locale/en.ts'
import pt from 'vuetify/src/locale/pt.ts'

function loadLocaleMessages() {
    const locales = require.context('../locales', true, /[A-Za-z0-9-_,\s]+\.json$/i)
    let messages = {}
    locales.keys().forEach(key => {
        const matched = key.match(/([A-Za-z0-9-_]+)\./i)
        if (matched && matched.length > 1)
            messages[matched[1]] = locales(key)
    })
    messages.en = Object.assign(messages.en, {$vuetify: en});
    messages.pt = Object.assign(messages.pt, {$vuetify: pt});
    return messages
}

export default new VueI18n({
    locale: store.getters.locale,
    // fallbackLocale: process.env.VUE_APP_I18N_FALLBACK_LOCALE || 'en',
    messages: loadLocaleMessages()
})
