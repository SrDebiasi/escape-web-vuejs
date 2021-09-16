<template>
  <v-speed-dial
      v-model="fab"
      :top="top"
      :bottom="bottom"
      :right="right"
      :left="left"
      :direction="direction"
      :open-on-hover="hover"
      :transition="transition"
      class="mt-10"
  >
    <template v-slot:activator>
      <v-btn
          v-model="fab"
          color="darken-2"
          small
          fab>
        <v-icon v-if="fab">mdi-close</v-icon>
        <v-icon v-else>mdi-account-circle</v-icon>
      </v-btn>
    </template>
    <v-btn
        fab
        color="black">
      <v-icon>mdi-pencil</v-icon>
    </v-btn>
    <v-btn
        fab
        @click="logout"
        color="black">
      <v-icon>mdi-logout</v-icon>
    </v-btn>
  </v-speed-dial>
</template>

<script>
//import user from '@/store/user'

export default {
  data: () => ({
    direction: 'bottom',
    fab: false,
    fling: false,
    hover: false,
    tabs: null,
    top: false,
    right: true,
    bottom: true,
    left: false,
    transition: 'slide-y-reverse-transition',
  }),

  methods: {
    logout() {
      this.$store.commit('logout');
      this.$router.push({name: "login"});
    }
  },

  computed: {
    activeFab() {
      switch (this.tabs) {
        case 'one':
          return {class: 'black', icon: 'account_circle'}
        case 'two':
          return {class: 'black', icon: 'edit'}
        case 'three':
          return {class: 'black', icon: 'keyboard_arrow_up'}
        default:
          return {}
      }
    },
  },


}
</script>
