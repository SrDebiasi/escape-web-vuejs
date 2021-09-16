<template>
  <v-app-bar
      id="app-bar"
      absolute
      app
      color="transparent"
      flat
      height="75">

    <v-toolbar-title class="hidden-sm-and-down font-weight-light">{{ $t('menu.' + $route.name) }}</v-toolbar-title>

    <v-spacer/>

    <vi-profile-dial/>
    <v-btn
        class="mt-3"
        elevation="1"
        fab
        right
        small
        @click="setDrawer(!drawer)">
      <v-icon>
        mdi-menu
      </v-icon>
    </v-btn>
  </v-app-bar>

</template>

<script>
import {mapMutations} from "vuex";

export default {
  name: "vi-bar",
  components: {
    viProfileDial: () => import('@/components/core/profile-dial')
  },

  computed: {
    drawer() {
      return this.$store.getters.getDrawer
    },
  },
  methods: {
    ...mapMutations({
      setDrawer: 'SET_DRAWER',
    })
  },
  props: {
    value: {
      type: Boolean,
      default: true,
    },
  },
}
</script>
