<template>
  <v-main>
    <router-view/>
  </v-main>
</template>

<script>
export default {
  name: 'vi-view',

  components: {
   // viFooter: () => import('@/components/core/footer')
  },
}
</script>

<style>

/* width */
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

/* Track */
::-webkit-scrollbar-track {
  -webkit-box-shadow: inset 0 0 6px rgba(0, 0, 0, 0.3);
  -webkit-border-radius: 6px;
  border-radius: 6px;
}

/* Handle */
::-webkit-scrollbar-thumb {
  -webkit-border-radius: 6px;
  border-radius: 6px;
  background: rgba(192, 192, 192, 0.8);
  -webkit-box-shadow: inset 0 0 6px rgba(0, 0, 0, 0.5);
}

::-webkit-scrollbar-thumb:window-inactive {
  background: rgba(192, 192, 192, 0.4);
}
</style>
