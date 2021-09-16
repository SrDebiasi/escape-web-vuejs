<template>
  <v-app id="inspire">
    <v-row
        align="center"
        justify="center"
        class="mx-5">
      <v-col
          sm="8"
          md="4"
          xl="4">
        <v-card class="elevation-12" elevation="5" :loading="loader.loading ? 'white' : false" v-show="!isLoggedIn">
          <v-toolbar
              flat>
            <v-toolbar-title center>{{ $t('account.labels.header') }}</v-toolbar-title>
          </v-toolbar>
          <v-card-text>
            <v-form>
              <v-text-field
                  :label="$t('account.labels.name')"
                  v-model="user.name"
                  prepend-icon="mdi-account"
                  type="text"
              ></v-text-field>
              <v-text-field
                  :label="$t('account.labels.email')"
                  v-model="user.email"
                  prepend-icon="mdi-gmail"
                  type="text"
              ></v-text-field>
              <v-text-field
                  :label="$t('account.labels.company')"
                  v-model="user.company"
                  prepend-icon="mdi-human-greeting"
                  type="text"
              ></v-text-field>
              <v-text-field
                  :label="$t('account.labels.password')"
                  v-model="user.password"
                  prepend-icon="mdi-lock"
                  type="password"
              ></v-text-field>
              <v-text-field
                  :label="$t('account.labels.repeat_password')"
                  v-model="user.password_confirmation"
                  prepend-icon="mdi-lock"
                  type="password"
                  v-on:keyup.enter="register"
              ></v-text-field>
            </v-form>
          </v-card-text>
          <v-layout justify-center>
            <v-card-actions>
              <v-spacer></v-spacer>
              <router-link to="/register" class="text-decoration-none">
                <v-btn large color="primary" class="px-10" block :disabled="loader.loading" @click="register">
                  {{ $t('account.labels.submit') }}
                </v-btn>
              </router-link>
            </v-card-actions>
          </v-layout>
          <v-layout justify-center>
            <router-link to="/login" class="text-decoration-none">
              <v-btn text small class="px-10 mb-2">
                {{ $t('common.login') }}
              </v-btn>
            </router-link>
          </v-layout>
        </v-card>
      </v-col>
    </v-row>
    <vi-footer></vi-footer>
  </v-app>
</template>

<script>

import User from '@/resources/User.js'
import '@/filters/filters'

export default {
  name: 'register',
  data: function () {
    return {
      repeatPassword: '',
      user: User.new(),

      loader: {loading: false},
      attempt: false
    }
  },
  components: {
    viFooter: () => import('@/components/core/footer'),
  },
  computed: {
    isLoggedIn: function () {
      return this.$store.getters.isLoggedIn
    },
  },

  methods: {
    register: function () {
      this.user.locale = this.$i18n.locale
      User.save({
        loader: this.loader,
        params: this.user
      }).then((response) => {
        if (response.status != 200) {
          this.$toast.error(this.$i18n.t('login.error'))
          return
        }
        this.$toast.success(this.$i18n.t('account.created'))
        this.$router.push({name: "login"});
      }).catch((error) => {
        // eslint-disable-next-line no-unused-vars
        for (const [key, value] of Object.entries(JSON.parse(error.response.data))) {
          this.$toast.error(this.$i18n.t('account.required', {field: this.$i18n.t('account.labels.' + key)}))
        }
      });
    },

    created() {
    },
  }
}
</script>