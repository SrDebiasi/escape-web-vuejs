import Vue from 'vue'
import i18n           from '@/plugins/i18n'

/**
 * capitalize first word
 * JOHN JOHN - JOHN JOHN
 * john john - John john
 */
Vue.filter('capitalize', function (value) {
    if (!value) return ''
    return value.toString().charAt(0).toUpperCase() + value.slice(1)
})

/**
 * capitalize first word
 * JOHN JOHN - JOHN JOHN
 * john john - John John
 */
Vue.filter('capitalize_all', function (value) {
    if (!value) return ''
    let words = value.split(' ')
    let newWords = words.map(word => {
        return word.charAt(0).toUpperCase() + word.slice(1)
    })
    return newWords.join(" ")
})

/**
 * use current language to fix currency
 */
Vue.filter('currency', function (value) {
    if (!value) return ''
    let locale = i18n.t('currency.locale')
    let iso = i18n.t('currency.iso')
    //Use the ISO 4217 currency
    return new Intl.NumberFormat(locale, { style: 'currency', currency: iso }).format(value)
})