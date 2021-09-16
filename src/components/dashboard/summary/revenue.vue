<template>
  <v-card>
    <v-card-text>

      <v-card
          class="text-center v-card--offset"
          elevation="10"
          color="green"
          height="100px"
          width="100px">
        <v-icon size="36" class="mt-7">mdi-cash</v-icon>
      </v-card>

      <v-card-text class="text-right">
        <v-progress-circular v-show="loader.loading" :indeterminate="loader.loading" class="mr-3"/>
        <span class="grey--text">{{ $t('summary.revenue.title') }}</span>
        <h3> {{ value | currency }} </h3>
      </v-card-text>

    </v-card-text>

    <v-divider/>

    <v-card-actions>
      <v-icon size="18" class="mr-2">mdi-calendar</v-icon>
      <span class="card-updated-time">{{ $t('summary.revenue.footer') }}</span>
    </v-card-actions>
  </v-card>
</template>

<script>

import User from "@/resources/User";
import Schedule from "@/resources/Schedule";


export default {
  data: () => ({
    value: 0,
    rooms: {type: Array, itens: []},
    schedules: {type: Array, itens: []},
    loader: {loading: false},
    timetables: [],
  }),

  methods: {

    /**
     * Search and sum the payment value of this month
     */
    getSchedules() {
      Schedule.get({
        params: {company_id: User.command('get.company').id, range: 'this-month'},
        loader: this.loader,
        supply: this.schedules.itens
      }).then(() => {
        this.value = parseFloat(this.schedules.itens.reduce((sum, schedule) => ({
          payment_value: parseFloat(sum.payment_value) + parseFloat(schedule.payment_value)
        })).payment_value)
      })
    },


  },

  mounted() {
    this.getSchedules()
  }


}
</script>

<style lang="scss" scoped>
.v-sheet--offset {
  top: -20px;
  position: relative;
}

.v-card--offset {
  top: -20px;
  position: absolute;
}

.card-updated-time {
  font-size: 13px;
  font-weight: 300;
  color: #999;
}
</style>