<template>
  <v-container>
    <v-sheet>
      <v-card :loading="loader.loading" elevation="0" class="mb-1">
        <v-toolbar>
          <v-menu
              ref="menuDate"
              v-model="menuDate"
              :close-on-content-click="false"
              transition="scale-transition"
          >
            <template v-slot:activator="{ on, attrs }">
              <v-text-field
                  v-model="formattedDate"
                  :label="$t('common.date')"
                  v-bind="attrs"
                  v-on="on"
                  hide-details
              >
              </v-text-field>
            </template>
            <v-date-picker
                :locale="$t('locale')"
                v-model="date"
                @input="selectDate"
            ></v-date-picker>
          </v-menu>

          <v-btn text small @click="prev">
            <v-icon small>mdi-chevron-left</v-icon>
          </v-btn>
          <v-btn text small @click="next">
            <v-icon small>mdi-chevron-right</v-icon>
          </v-btn>
          <v-btn class="ml-4" @click="setToggle">
            {{ $t('calendar.' + (show ? 'hide' : 'show')) }}
          </v-btn>
          <v-spacer></v-spacer>
          <v-menu bottom right>
            <template v-slot:activator="{ on, attrs }">
              <v-btn
                  v-bind="attrs"
                  v-on="on">
                <span>{{ $t('calendar.' + type) }}</span>
                <v-icon right>mdi-menu-down</v-icon>
              </v-btn>
            </template>
            <v-list>
              <v-list-item @click="type = 'category'">
                <v-list-item-title>{{ $t('calendar.category') }}</v-list-item-title>
              </v-list-item>
              <v-list-item @click="type = 'day'">
                <v-list-item-title>{{ $t('calendar.day') }}</v-list-item-title>
              </v-list-item>
              <v-list-item @click="type = 'week'">
                <v-list-item-title>{{ $t('calendar.week') }}</v-list-item-title>
              </v-list-item>
              <v-list-item @click="type = 'month'">
                <v-list-item-title>{{ $t('calendar.month') }}</v-list-item-title>
              </v-list-item>
              <v-list-item @click="type = '4day'">
                <v-list-item-title>{{ $t('calendar.4day') }}</v-list-item-title>
              </v-list-item>
            </v-list>
          </v-menu>
        </v-toolbar>
      </v-card>
    </v-sheet>
    <v-expand-transition>
      <v-sheet height="500" v-show="show">
        <v-calendar
            ref="calendar"
            v-model="calendar"
            :locale="$t('locale')"

            :events="events"
            :event-color="getEventColor"
            :type="type"
            :short-intervals="false"
            :short-weekdays="false"
            :categories="categories"

            category-show-all

            @click:event="showEvent"
            @click:more="viewDay"
            @click:date="viewDay"
        >
          <template #day-body="{ date, week }">
            <div
                class="v-current-time"
                :class="{ first: date === week[0].date }"
                :style="{ top: nowY }"
            ></div>
          </template>
        </v-calendar>
      </v-sheet>
    </v-expand-transition>
  </v-container>

</template>

<script>

import Schedule from "@/resources/Schedule";
import User from "@/resources/User";
import Room from "@/resources/Room";
import moment from "moment";

export default {
  name: "vi-valendar",
  props: {
    value: {
      type: Number,
      default: null,
    },
    show: {
      type: Boolean,
      default: false,
    },
    date: {
      type: Date,
      default: null,
    },
  },
  data: () => ({
    calendar: '',
    events: [],
    ready: false,
    menuDate: false,

    schedule: {type: Array, itens: []},
    type: 'day',
    selectedEvent: {},
    selectedElement: null,
    selectedOpen: false,
    loader: {loading: false},
    colors: ['blue', 'indigo', 'deep-purple', 'cyan', 'green', 'orange', 'grey darken-1'],
    categories: [],
  }),

  mounted() {
    this.ready = true
    this.calendar = this.date

    Room.get({
      params: {company_id: User.command('get.company').id},
      loader: this.loader,
    }).then((data) => {
      this.categories = data.data.map(a => a.name)
    })

    const events = []
    Schedule.get({
      params: {company_id: User.command('get.company').id},
      loader: this.loader,
      supply: this.schedule.itens,
    }).then(() => {
      for (let i = 0; i < this.schedule.itens.length; i++) {
        let appointment = this.schedule.itens[i]
        events.push({
          name: appointment.name,
          start: `${appointment.day} ${appointment.timetable.start}`,
          end: '2020-08-21 16:00',
          color: this.colors[1],
          timed: true,
          category: appointment.timetable.room.name,
        })
      }
      this.events = events
      this.scrollToTime()
    })
  },

  computed: {

    cal() {
      return this.ready ? this.$refs.calendar : null
    },

    nowY() {
      return this.cal ? this.cal.timeToY(this.cal.times.now) + 'px' : '-10px'
    },

    formattedDate() {
      return moment(this.date).format(this.$i18n.t('dates.date'))
    },

  },

  methods: {

    selectDate() {
      this.menuDate = false
      this.calendar = this.date
      this.type = 'day'
    },


    moment({data, mask}) {
      return moment(data).format(mask)
    },

    getCurrentTime() {
      return this.cal ? this.cal.times.now.hour * 60 + this.cal.times.now.minute : 0
    },

    scrollToTime() {
      const time = this.getCurrentTime()
      const first = Math.max(0, time - (time % 30) - 30)

      this.cal.scrollToTime(first)
    },

    viewDay({date}) {
      this.calendar = date
      this.type = 'day'
    },

    getEventColor(event) {
      return event.color
    },

    setToggle() {
      this.show = !this.show;
      this.$emit('visible', {visible: this.show})
    },

    prev() {
      this.$refs.calendar.prev()
      this.date = this.calendar
    },

    next() {
      this.$refs.calendar.next()
      this.date = this.calendar
    },

    // showEvent({nativeEvent, event}) {
    //   const open = () => {
    //     this.selectedEvent = event
    //     this.selectedElement = nativeEvent.target
    //     setTimeout(() => this.selectedOpen = true, 10)
    //   }
    //
    //   if (this.selectedOpen) {
    //     this.selectedOpen = false
    //     setTimeout(open, 10)
    //   } else {
    //     open()
    //   }
    //
    //   nativeEvent.stopPropagation()
    // },

  },

  watch: {
    date() {
      this.calendar = this.date
      this.$emit('change', {date: this.calendar})
    },
    show() {

    }
  }

}
</script>
<style lang="scss">
.theme--dark.v-calendar-weekly .v-calendar-weekly__day,
.theme--dark.v-calendar-weekly .v-calendar-weekly__head-weekday {
  border-right: 1px solid #3c3c3c;
  border-bottom: 1px solid #3c3c3c;
}

.theme--dark.v-calendar-weekly {
  border-top: 1px solid #3c3c3c;
  border-left: 1px solid #3c3c3c;
}

.v-calendar-weekly__day-label .v-btn--fab.v-size--small {
  height: 25px;
  width: 25px;
}

.v-current-time {
  height: 2px;
  background-color: #ea4335;
  position: absolute;
  left: -1px;
  right: 0;
  pointer-events: none;

  &.first::before {
    content: '';
    position: absolute;
    background-color: #ea4335;
    width: 12px;
    height: 12px;
    border-radius: 50%;
    margin-top: -5px;
    margin-left: -6.5px;
  }
}

.theme--dark.v-calendar-weekly,
.theme--dark.v-calendar-daily,
.theme--dark.v-calendar-daily .v-calendar-daily__day-interval,
.theme--dark.v-calendar-daily .v-calendar-daily__day-interval:first-child,
.theme--dark.v-calendar-daily .v-calendar-daily__interval::after {
  border-top: #3c3c3c 1px solid;
}

.theme--dark.v-calendar-weekly,
.theme--dark.v-calendar-daily {
  border-left: #3c3c3c 1px solid;
}

.theme--dark.v-calendar-weekly .v-calendar-weekly__head-weekday,
.theme--dark.v-calendar-weekly .v-calendar-weekly__head-weeknumber,
.theme--dark.v-calendar-weekly .v-calendar-weekly__day,
.theme--dark.v-calendar-weekly .v-calendar-weekly__weeknumber,
.theme--dark.v-calendar-daily .v-calendar-daily__intervals-head,
.theme--dark.v-calendar-daily .v-calendar-daily_head-day,
.theme--dark.v-calendar-daily .v-calendar-daily__intervals-body,
.theme--dark.v-calendar-daily .v-calendar-daily__day,
.theme--dark.v-calendar-category .v-calendar-category__column,
.theme--dark.v-calendar-category .v-calendar-category__column-header,
.theme--dark.v-calendar-weekly .v-calendar-weekly__head-weeknumber,
.theme--dark.v-calendar-weekly .v-calendar-weekly__day,
.theme--dark.v-calendar-weekly .v-calendar-weekly__weeknumber {
  border-right: #3c3c3c 1px solid;
}

.theme--dark.v-calendar-weekly .v-calendar-weekly__day,
.theme--dark.v-calendar-weekly .v-calendar-weekly__weeknumber,
.theme--dark.v-calendar-daily .v-calendar-daily_head-day,
.theme--dark.v-calendar-daily .v-calendar-daily__day,
.theme--dark.v-calendar-weekly .v-calendar-weekly__day,
.theme--dark.v-calendar-weekly .v-calendar-weekly__weeknumber {
  border-bottom: #9e9e9e 1px solid;
}


</style>