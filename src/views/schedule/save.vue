<template>
  <v-row justify="center">
    <v-dialog v-model="value.visible" persistent max-width="800px">
      <v-card>
        <v-col cols="12" sm="12" md="12">
          <vi-calendar v-bind:show="showCalendar"
                       v-bind:date="day"
                       v-on:change="changeDate"
                       v-on:visible="calendarVisible"></vi-calendar>
        </v-col>
        <v-card-title>
          <span class="headline pr-3">{{ $tc('schedule.add-or-edit', (schedule.id ? 0 : 1)) }}</span>
          <v-progress-circular :indeterminate="vacancyLoader.loading"
                               v-show="vacancyLoader.loading"></v-progress-circular>
          <v-layout justify-end>
            <v-switch
                v-model="schedule.confirmed"
                :label="$t('common.confirmed')"
                color="rgb(38,109,41)"
            ></v-switch>
            <!-- :label="`${schedule.confirmed ? $t('common.confirmed') :  $t('common.unconfirmed')}`" can confuse user-->
            <v-switch
                class="ml-10"
                v-model="schedule.paid"
                :label="$t('schedule.labels.paid')"
                color="rgb(38,109,41)"
            ></v-switch>
          </v-layout>
        </v-card-title>
        <v-card-text>
          <v-container>
            <v-row>
              <!-- Rooms and Timetables -->
              <transition name="card">
                <v-card v-show="!vacancyLoader.loading" elevation="0" width="100%">

                  <v-row>
                    <v-col v-show="rooms.itens.length == 0">
                      {{ $t('schedule.no-room') }}
                    </v-col>
                    <v-col :sm="colsRooms"
                           :md="colsRooms"
                           :cols="colsRooms"
                           v-bind:key="room.id"
                           v-for="room in rooms.itens">

                      <v-btn block>
                        <span>{{ room.name }}</span>
                      </v-btn>
                      <transition-group :name="`room-${room.id}`" tag="div">
                        <v-col v-for="timetable in room.timetables"
                               v-bind:key="timetable.id"
                               v-show="!vacancyLoader.loading"
                        >
                          <v-btn
                              block
                              :disabled="!timetable.available"

                              @click="chooseTimetable(timetable)"
                              v-bind:class="{ 'green':  schedule.timetable_id == timetable.id }"
                          >
                            <span>{{ timetable.start }}</span>
                            <v-badge
                                class="ml-3"
                                :color="badgeColor(timetable)"
                                :content="badgeText(timetable)"
                            >
                            </v-badge>
                          </v-btn>
                        </v-col>
                      </transition-group>
                    </v-col>
                  </v-row>
                </v-card>
              </transition>

              <!-- Rest of the form -->
              <v-col cols="12" sm="12" md="12">
                <v-text-field
                    :label="$t('schedule.labels.name_responsible')"
                    v-model.trim="schedule.name"
                    :error-messages="($v.schedule.name.$invalid && $v.schedule.name.$dirty) ? $t('form.field_required') : ''"
                    @input="$v.schedule.name.$touch"
                    required></v-text-field>
              </v-col>
              <v-col cols="6" sm="12" md="6">
                <v-text-field
                    :label="$t('schedule.labels.phone')"
                    v-model="schedule.phone"
                    :error-messages="($v.schedule.phone.$invalid && $v.schedule.phone.$dirty) ? $t('form.field_required') : ''"
                    @input="$v.schedule.phone.$touch"
                    v-mask="$t('phone.mask')"
                    required></v-text-field>
              </v-col>
              <v-col cols="6" sm="12" md="6">
                <v-text-field
                    :label="$t('schedule.labels.email')"
                    v-model.trim="schedule.email"
                    :error-messages="($v.schedule.email.$invalid && $v.schedule.email.$dirty) ? $t('form.field_required') : ''"
                    @input="$v.schedule.email.$touch"
                    required></v-text-field>
              </v-col>
              <v-col cols="12" sm="12" md="12" class="mt-5">
                <v-slider
                    :label="$t('schedule.labels.quantity')"
                    v-model="schedule.quantity"
                    :error-messages="($v.schedule.quantity.$invalid && $v.schedule.quantity.$dirty) ? $t('form.field_required') : ''"
                    @input="$v.schedule.quantity.$touch"
                    required
                    :hint="$t('common.people')"
                    persistent-hint
                    thumb-label="always"
                    @change="calculateTicket"
                    :max="maxVacancies"
                    step="1"
                    min="0"
                ></v-slider>
              </v-col>
              <v-col cols="12" sm="6" md="6">
                <v-select
                    :label="$t('schedule.labels.payment_type')"
                    v-model="schedule.payment_type"
                    :items="paymentType"
                    :error-messages="($v.schedule.payment_type.$invalid && $v.schedule.payment_type.$dirty) ? $t('form.field_required') : ''"
                    persistent-hint
                ></v-select>
              </v-col>
              <v-col cols="12" sm="6" md="6">
                <v-currency-field
                    sm="12" md="6"
                    v-model="schedule.payment_value"
                    :label="$t('schedule.labels.payment_value')"
                    :hint="$t('schedule.labels.payment_value')"
                    :prefix="$t('currency.prefix')"
                    required/>
              </v-col>
            </v-row>
          </v-container>

        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn @click="close">{{ $t('common.close') }}</v-btn>
          <v-btn @click="save" color="success">{{ $t('common.save') }}</v-btn>
        </v-card-actions>

      </v-card>
    </v-dialog>
  </v-row>
</template>

<script>
import Schedule from '@/resources/Schedule'
import Room from '@/resources/Room'
import User from "@/resources/User";
import moment from "moment";

export default {
  props: {
    value: {
      type: Object,
      default: () => ({
        visible: false,
        id: null,
      }),
    }
  },
  components: {
    viCalendar: () => import('@/components/schedule/calendar'),
  },

  data() {
    return {
      changes: false,

      day: moment().format(this.$i18n.t('database.date')),
      schedule: Schedule.new(),

      showCalendar: true,
      selectedTimetable: null,

      maxVacancies: 100,
      vacancyLoader: {loading: false},
      rooms: {type: Array, itens: []},

      //Two types available
      paymentType: [
        {'value': 1, 'text': this.$i18n.t('schedule.labels.payment_money')},
        {'value': 2, 'text': this.$i18n.t('schedule.labels.payment_credit_debit_card')},
      ],
    }
  },

  /* Validations from resource */
  validations: {
    schedule: Schedule.validations()
  },

  created() {
    this.changeDate({date: this.day})
  },

  /* Methods: save, edit, close */
  methods: {

    /**
     * Search the schedule
     * @returns void
     */
    find() {
      if (this.value.id)
        Schedule.show({
          params: {id: this.value.id},
          loader: true,
          supply: this.schedule,
        }).then(() => {
          this.selectedTimetable = this.schedule.timetable
          this.maxVacancies = this.schedule.quantity
          this.day = this.schedule.day
        });
    },

    /**
     * Change date from calendar, reload the table vacancies
     * @returns void
     */
    changeDate({date}) {
      if (date == '') return
      this.day = date
      setTimeout(() => {
        this.availableTimetables({date: date})
      }, 600)
    },

    /**
     * Show or hide the calendar
     * @returns void
     */
    calendarVisible({visible}) {
      this.showCalendar = visible
    },

    /**
     * Wait to call, user can navigate clicking between days..
     * @returns void
     */
    availableTimetables({date}) {
      if (this.day == date)
        Room.get({
          params: {
            company_id: User.command('get.company').id,
            enable: true,
            available: true,
            ignore: this.value.id, // ignore actual schedule on edit
            date: moment(this.day).format(this.$i18n.t('database.date'))
          },
          loader: this.vacancyLoader,
        }).then((result) => {
          //The user can change the date before the callback, promise can return in any order, only receive the actual chosen date
          if (this.day == result.config.params.date) {
            this.rooms.itens = result.data;
            if (this.schedule.timetable_id != null)
              this.maxVacancies = this.rooms.itens.find(
                  (room) => (room.id == this.schedule.timetable.room_id)).timetables.find(
                  (timetable) => (timetable.id == this.schedule.timetable_id)).vacancies
          }
        });
    },


    /**
     *  Choose a timetable
     * @returns void
     */
    chooseTimetable(timetable) {
      this.selectedTimetable = timetable // local to calculate values
      this.schedule.timetable.room_id = timetable.room_id
      this.schedule.timetable_id = timetable.id
      this.maxVacancies = timetable.vacancies
      this.schedule.quantity = this.schedule.quantity > timetable.vacancies ? timetable.vacancies : this.schedule.quantity
    },

    /**
     *  Choose a timetable
     * @returns void
     */
    calculateTicket() {
      if (this.selectedTimetable ?? null) {
        if (this.selectedTimetable.room.schedule_type === Room.SCHEDULE_TYPE_TICKET())
          this.schedule.payment_value = this.selectedTimetable.room.ticket_price * this.schedule.quantity
        if (this.selectedTimetable.room.schedule_type === Room.SCHEDULE_TYPE_ROOM())
          this.schedule.payment_value = this.selectedTimetable.room.room_price
      }
    },

    /**
     *  Color of the badge
     * @returns string
     */
    badgeColor(timetable) {
      if (!timetable.available) return 'red'
      if (timetable.busy) return 'red'
      if (!timetable.busy) return 'green darken-2'
    },

    /**
     *  Text of the badge
     * @returns string
     */
    badgeText(timetable) {
      if (timetable.busy == true) return this.$i18n.t('common.busy')
      return timetable.vacancies != 0 ? timetable.vacancies : this.$i18n.t('common.full')
    },

    /**
     *  save - use to save the resource
     * @returns void
     */
    save() {
      // day is a local property - need to feed the object
      this.schedule.day = moment(this.day).format(this.$i18n.t('database.date'))
      this.$v.$touch()
      if (this.$v.$invalid) {
        this.$toast.error(this.$i18n.t('form.invalid_fields'))
        return
      }

      this.$v.$reset()
      Schedule.save({
        params: this.schedule,
        loader: true
      }).then(() => {
        this.$toast.success(this.$i18n.t('message.save.success', {resource: this.$i18n.t('common.schedule')}))
        this.changes = true
        this.close()
      }).catch((error) => {
        this.$toast.error(error)
      });
    },


    /**
     *  close -  close the modal
     * @returns void
     */
    close() {
      this.$emit('requestClose', {changes: this.changes})
      this.schedule = Schedule.new()
      this.maxVacancies = 100;
      this.$v.$reset()
      //To dispatch event on calendar and always reload the timetables
      this.day = moment().format(this.$i18n.t('database.date'))
      this.rooms.itens = []
      this.changes = false
    },

  },

  /* Computed fields */
  computed: {
    colsRooms() {
      return 12 / this.rooms.itens.length
    }
  },

  /* Watch the value.id from list*/
  watch: {
    'value.id'() {
      this.find()
    },
    'value.visible'() {
      // not editing, new date
      if (this.value.id == null && this.value.visible) {
        this.availableTimetables({date: this.day})
      }
    }
  },

}
</script>
<style>

.card-enter-active, .card-leave-active {
  transition: all 2s;
}

.card-enter, .card-leave-to {
  opacity: 0;
  transform: translateY(-30px);
}


.room-2-enter-active, .room-2-leave-active {
  transition: all 2s;
}

.room-2-enter, .room-2-leave-to {
  opacity: 0;
  transform: translateX(-30px);
}


.room-1-enter-active, .room-1-leave-active {
  transition: all 2s;
}

.room-1-enter, .room-1-leave-to {
  opacity: 0;
  transform: translateX(30px);
}


</style>