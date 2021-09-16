<template>
  <v-footer class="my-auto mb-0" fixed inset app height="40" width="auto">
    <v-layout justify-end>
      <v-menu open-on-hover top offset-y>
        <template v-slot:activator="{ on }">
          <v-btn
              color="primary"
              small
              v-on="on">
            <v-icon>mdi-translate</v-icon>
          </v-btn>
        </template>

        <v-list>
          <v-list-item
              v-for="locale in locales"
              :key="locale.language"
              @click="switchLocale(locale.language)">
            <v-list-item-title>{{ $t(locale.text) }}</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>
    </v-layout>
  </v-footer>
</template>

<script>

import User from '@/resources/User.js'

export default {
  name: 'vi-footer',

  data: function () {
    return {
      locales: [
        {
          language: 'en',
          text: 'language.english',
        },
        {
          language: 'pt',
          text: 'language.portuguese',
        },
      ],
    }
  },

  methods: {
    /**
     * Switch languages
     * @param locale
     */
    switchLocale(locale) {
      if (this.$i18n.locale !== locale) {
        this.$vuetify.lang.current = locale
        if (this.$store.getters.isLoggedIn) {
          User.save({
            append: '/locale',
            params: {locale: locale}
          }).then((response) => {
            this.$store.commit('user', {user: response.data})
          });
        } else {
          this.$store.commit('locale', {locale: locale})
        }
        this.$i18n.locale = locale;
      }
    }
  },
}
</script>

