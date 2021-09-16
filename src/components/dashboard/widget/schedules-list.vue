<template>
  <v-card :loading="loader.loading" min-height="100">
    <v-card-title>
      {{ $t('widget.timetables-list.title') }}
    </v-card-title>
    <v-card-text>
      <v-data-table
          :headers="headers"
          :items="data.itens"
          hide-default-header
          hide-default-footer
          dense
      >
        <template v-slot:item.name="{ item }">
          {{ item.name | capitalize }}
        </template>
        <template v-slot:item.phone="{ item }">
          {{ item.phone | VMask($t('phone.mask')) }}
        </template>

        <template v-slot:item.day="{ item }">
          {{ moment({data: item.day, mask: $t('dates.date')}) }}
        </template>
      </v-data-table>
    </v-card-text>
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

import Schedule from "@/resources/Schedule";
import User from "@/resources/User";

import Room from "@/resources/Room";
// eslint-disable-next-line no-unused-vars
import moment from 'moment';

export default {

  data() {
    return {
      data: {type: Array, itens: []},
      schedules: {type: Array, itens: []},
      rooms: {type: Array, itens: []},
      loader: {loading: false},
      headers: [
        {text: this.$i18n.t('schedule.labels.name'), align: 'start', value: 'name', filter: this.stringFilter},
        {text: this.$i18n.t('schedule.labels.phone'), value: 'phone'},
        {text: this.$i18n.t('schedule.labels.timetable'), value: 'timetable.start', align: 'center'},
        {text: this.$i18n.t('schedule.labels.room'), value: 'timetable.room.name', filter: this.stringFilter},
        {text: this.$i18n.t('schedule.labels.day'), value: 'day', align: 'center', filter: this.dayFilter},
        {text: this.$i18n.t('schedule.labels.quantity'), value: 'quantity', align: 'center'},
      ]
    }
  },

  methods: {

    /**
     * Search the schedules with last 7 days range
     */
    getSchedules() {
      Schedule.get({
        params: {company_id: User.command('get.company').id, range: 'next7days'},
        loader: this.loader,
        supply: this.schedules.itens
      }).then(() => {
        //sort by day > now
        this.schedules.itens.sort((a, b) => parseInt(a.day.replaceAll('-', '')) - parseInt(b.day.replaceAll('-', '')))
        //limit first 5 appointments
        this.schedules.itens.length = 5
        //use data.itens to apply filter by rooms
        this.data.itens = this.schedules.itens
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
     * Mask a date with moment for view
     * @param data
     * @param mask
     * @returns {string}
     */
    moment({data, mask}) {
      return moment(data).format(mask)
    },

    /**
     * Filter the list
     * @param room Resource
     */
    filter(room) {
      this.data.itens = this.schedules.itens.filter(schedule => {
        return (room != undefined ? schedule.timetable.room.id == room.id : true)
      })
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
    this.getRooms()
    this.getSchedules()
  }


}
</script>

<style lang="scss" scoped>

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