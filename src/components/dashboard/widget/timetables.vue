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
      {{ $t('widget.timetables.title') }}
    </v-card-title>
    <v-card-subtitle>
      {{ $t('widget.timetables.subtitle') }}
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

import Room from "@/resources/Room";
import User from "@/resources/User";
import Schedule from "@/resources/Schedule";

export default {
  data: () => ({
    schedules: {type: Array, itens: []},
    rooms: {type: Array, itens: []},
    loader: {loading: false},
    timetables: [],
  }),

  methods: {

    /**
     * Search the schedules with last 7 days range
     */
    getSchedules() {
      Room.get({
        params: {company_id: User.command('get.company').id},
        loader: this.loader,
        supply: this.rooms.itens
      }).then(() => {
        this.rooms.itens.forEach((room) => {
          //fill all the times
          room.timetables.forEach((timetable) => {
            this.timetables.push({start: timetable.start, name: timetable.start, value: 0})
          })
          //must not repeat the times
          this.timetables = [...new Map(this.timetables.map(item => [item['start'], item])).values()];
          //sort times by start time
          this.timetables.sort((a, b) => parseInt(a.start.replace(':', '')) - parseInt(b.start.replace(':', '')))
        })
        //after get the rooms, get schedules
        Schedule.get({
          params: {company_id: User.command('get.company').id, range: 'last7days'},
          loader: this.loader,
          supply: this.schedules.itens
        }).then(() => {
          this.calculate()
        })
      })

    },

    /**
     * Calculate the graph, filter if room filled
     * @param room Room resource
     */
    calculate(room = undefined) {
      this.timetables.forEach((timetable) => {
        timetable.value = this.schedules.itens.filter(schedule => {
          return (schedule.timetable.start === timetable.start)
              && (room != undefined ? schedule.timetable.room.id == room.id : true)
        }).length
      })
    },

    /**
     * Filter using resource room
     * @param value Value to be tested.
     */
    filter(room) {
      this.calculate(room)
    },


  },

  computed: {
    names() {
      return this.timetables.map(timetable => timetable.start)
    },
    values() {
      return this.timetables.map(timetable => timetable.value)
    }
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