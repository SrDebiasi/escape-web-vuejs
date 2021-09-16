<template>
  <v-navigation-drawer
      id="core-navigation-drawer"
      :value="drawer"
      :dark="barColor !== 'rgba(228, 226, 226, 1), rgba(255, 255, 255, 0.7)'"
      :src="barImage"
      mobile-breakpoint="960"
      app
      right
      width="260">

    <!--    <template v-slot:img="props">-->
    <!--      <v-img :gradient="`to bottom, ${barColor}`"-->
    <!--             v-bind="props"/>-->
    <!--    </template>-->

    <v-divider class="mb-2"/>

    <v-list expand nav>
      <template v-for="(menu, i) in menuItems">
        <item
            :key="`menu-${i}`"
            :item="menu"
        />
      </template>
    </v-list>
  </v-navigation-drawer>
</template>

<script>
import Item from "@/components/base/item";
import user from '@/store/user'

export default {
  name: "vi-navigation",
  components: {Item},
  data: () => ({
    menu: [
      {
        title: 'menu.dashboard',
        icon: 'mdi-home',
        to: '/',
      },
      {
        title: 'menu.schedule',
        icon: 'mdi-calendar',
        to: '/schedule',
      },
      {
        title: 'menu.room',
        icon: 'mdi-door-closed-lock',
        to: '/room',
      },
      {
        title: 'menu.embed',
        icon: 'mdi-code-tags',
        to: '/embed',
      },
    ],
  }),
  computed: {
    drawer() {
      return this.$store.getters.getDrawer
    },
    menuItems() {
      return this.menu.map(this.mapItem)
    },
    barImage() {
      return this.$store.getters.getBarImage
    },
    barColor() {
      return this.$store.getters.getBarColor
    },
    profile() {
      return user.getUser()
    },
  },
  methods: {
    mapItem(item) {
      return {
        ...item,
        children: item.children ? item.children.map(this.mapItem) : undefined,
        title: this.$t(item.title),
      }
    },
    logout() {
      this.$store.commit('logout');
      this.$router.push({name: "login"});
    }

  },
}
</script>

<style scoped>

</style>