import Vue            from 'vue'
import VCurrencyField from 'v-currency-field'
import i18n           from '@/plugins/i18n'

Vue.use(VCurrencyField,{
  locale         : i18n.t('currency.locale'),
  decimalLength  : parseInt(i18n.t('currency.precision')), // From json always string
  autoDecimalMode: true,
  min            : null,
  max            : null,
  defaultValue   : 0,
  valueAsInteger : false,
  allowNegative  : false
})