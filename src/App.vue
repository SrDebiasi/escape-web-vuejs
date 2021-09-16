<template>
  <v-app id="inspire">
    <vi-loading :active.sync="isLoading" :is-full-page="fullPage"></vi-loading>
    <v-app v-if="isLoggedIn">
      <vi-bar/>
      <vi-navigation/>
      <vi-view/>
      <vi-footer/>
    </v-app>
    <v-app v-else>
      <vi-view/>
    </v-app>
  </v-app>
</template>


<script>

import 'vue-loading-overlay/dist/vue-loading.css';
import Info from "@/resources/Info";

export default {
  name: 'app',

  data() {
    return {
      fullPage: true
    }
  },

  components: {
    viBar: () => import('@/components/core/bar'),
    viNavigation: () => import('@/components/core/navigation'),
    viView: () => import('@/components/core/view'),
    viLoading: () => import('vue-loading-overlay'),
    viFooter: () => import('@/components/core/footer'),
  },

  created: function () {
    if (this.isLoggedIn)
      Info.command('refresh')
  },

  computed: {
    isLoggedIn: function () {
      return this.$store.getters.isLoggedIn
    },
    isLoading: function () {
      return this.$store.getters.isLoading
    }
  }
}

</script>

<style lang="scss" scoped>
.app {
  font-family: Roboto, sans-serif;
}

</style>