<template>
  <v-card :loading="loader.loading" min-height="200">
    <v-sheet
        class="v-sheet--offset mx-auto"
        color="green"
        elevation="12"
        max-width="calc(100% - 32px)"
    >
      <v-sparkline
          :labels="names"
          :value="values"
          color="white"
          line-width="1"
          smooth="5"
          auto-draw
          padding="12"
      ></v-sparkline>
    </v-sheet>
    <v-card-title class="pt-0">
      {{ $t('widget.schedules.title') }}
    </v-card-title>
    <v-card-subtitle>
      {{ $t('widget.schedules.subtitle') }}
    </v-card-subtitle>
    <v-card-actions>
      <v-btn
          v-bind:key="room.id"
          v-for="room in rooms.itens"
          @click="filter(room)">
        {{ room.short_name }}
      </v-btn>
      <v-btn @click="filter(undefined)">
        <v-icon>mdi-filter-remove</v-icon>
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script>
//import user from '@/store/user'

import Schedule from "@/resources/Schedule";
import User from "@/resources/User";

import moment from 'moment';
import Room from "@/resources/Room";

export default {

  data: () => ({
    schedules: {type: Array, itens: []},
    rooms: {type: Array, itens: []},
    loader: {loading: false},
    days: [],
  }),

  methods: {

    /**
     * Search the schedules with last 7 days range
     */
    getSchedules() {
      Schedule.get({
        params: {company_id: User.command('get.company').id, range: 'last7days'},
        loader: this.loader,
        supply: this.schedules.itens
      }).then(() => {
        let beginDate = moment().subtract(7, 'days');
        let endDate = moment();
        //fill the array 'x'
        while (beginDate.diff(endDate, 'days') < 0) {
          this.days.push({date: beginDate.clone(), name: beginDate.format(this.$i18n.t('dates.day-month')), value: []})
          beginDate.add(1, 'days')
        }
        //fill the array 'y'
        this.calculate()
      })
    },

    /**
     * Search the activated rooms
     */
    getRooms() {
      Room.get({
        params: {company_id: User.command('get.company').id, enable: true},
        loader: this.loader,
        supply: this.rooms.itens
      }).then(() => {
      })
    },

    /**
     * Fill the 'y' axis
     * @param room Resource, filtered if filled
     */
    calculate(room = undefined) {
      this.days.forEach((day) => {
        day.value = this.schedules.itens.filter(schedule => {
          return (schedule.day === day.date.format(this.$i18n.t('database.date')))
              && (room != undefined ? schedule.timetable.room.id == room.id : true)
        }).length
      })
    },

    /**
     * Filter schedules
     * @param room Resource
     */
    filter(room) {
      this.calculate(room)
    },


  },

  computed: {
    names() {
      return this.days.map((day) => day.name)
    },
    values() {
      return this.days.map((day) => day.value)
    },
  },
  mounted() {
    this.getSchedules()
    this.getRooms()
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