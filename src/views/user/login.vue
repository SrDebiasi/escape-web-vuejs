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
            <v-toolbar-title center>{{ $t('login.welcome', {company: 'Escape Schedule'}) }}</v-toolbar-title>
          </v-toolbar>
          <v-card-text>
            <v-form>
              <v-text-field
                  label="Login"
                  name="login"
                  v-model="email"
                  prepend-icon="mdi-account"
                  type="text"
                  v-on:keyup.enter="login"
              ></v-text-field>

              <v-text-field
                  id="password"
                  :label="$t('common.password')"
                  name="password"
                  v-model="password"
                  prepend-icon="mdi-lock"
                  type="password"
                  v-on:keyup.enter="login"
              ></v-text-field>
            </v-form>
          </v-card-text>
          <v-layout justify-center>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn large color="primary" class="px-10" block :disabled="loader.loading" @click="login">
                {{ $t('common.login') }}
              </v-btn>
            </v-card-actions>
          </v-layout>
          <v-layout justify-center>
            <v-card-actions>
              <router-link to="/register" class="text-decoration-none">
                <v-btn text small class="px-10">
                  {{ $t('account.labels.submit') }}
                </v-btn>
              </router-link>
            </v-card-actions>
          </v-layout>
        </v-card>
      </v-col>
      <vi-footer></vi-footer>
    </v-row>
  </v-app>
</template>

<script>

import User from '@/resources/User.js'

export default {
  name: 'login',
  data: function () {
    return {
      email: '',
      password: '',
      user: User.new(),

      loader: {loading: false},
      attempt: false
    }
  },
  computed: {
    isLoggedIn: function () {
      return this.$store.getters.isLoggedIn
    },
  },
  components: {
    viFooter: () => import('@/components/core/footer'),
  },

  methods: {
    login: function () {
      User.save({
        append: '/login',
        loader: this.loader,
        params: {email: this.email, password: this.password}
      }).then((response) => {
        if (response.status != 200) {
          this.$toast.error(this.$i18n.t('login.error'))
          return
        }
        //Store the JWT Token
        this.$store.commit('token', {token: response.data.token})
        //Store the authenticated user
        User.get().then((response) => {
          this.$store.commit('user', {user: response.data})
          //Redirect o to Home
          this.$router.push({name: "dashboard"});
        });
      }).catch((error) => {
        console.log('Login error ' + error)
        this.$toast.error(this.$i18n.t('login.error'))
      });
    },

    created() {
    },
  }
}
</script>