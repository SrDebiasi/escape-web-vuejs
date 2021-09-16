import i18n from '@/plugins/i18n'

export default ({
  config: {
    decimal  : i18n.t('currency.decimal'),
    thousands: i18n.t('currency.thousands'),
    prefix   : i18n.t('currency.prefix'),
    precision: parseInt(i18n.t('currency.precision')),
     masked   : false /* doesn't work with directive */
  }
});


