<template>
  <v-container fluid>
    <v-stepper v-model="step" alt-labels light>
      <v-stepper-header>
        <v-stepper-step :complete="step > 2" step="1">{{ $t('common.rooms') }}</v-stepper-step>

        <v-divider></v-divider>

        <v-stepper-step :complete="step > 3" step="2">Date</v-stepper-step>

        <v-divider></v-divider>

        <v-stepper-step step="3">Appointment</v-stepper-step>
      </v-stepper-header>

      <v-stepper-items>
        <v-stepper-content step="1">
          <v-row cols="12" v-if="rooms.itens.length != 0" justify="center">
            <v-col v-for="item in rooms.itens" v-bind:key="item.id"
                   :cols="colsImages"
            >
              <v-img
                  :src="path + item.picture_large"
                  @click="chooseRoom(item)"
                  max-height="300px"
                  contain
              ></v-img>
            </v-col>
          </v-row>

        </v-stepper-content>

        <v-stepper-content step="2">
          <v-row no-gutters justify="center">
            <v-col cols="12" md="4">
              <v-date-picker
                  :locale="$t('locale')"
                  v-model="day"
                  @change="chooseDay"
                  scrollable
              ></v-date-picker>
            </v-col>

            <v-col cols="12" md="4">
              <transition name="card">
                <v-card v-show="!vacancyLoader.loading && available.itens.length > 0" elevation="0" width="100%">
                  <v-row>
                    <v-col cols="4" align="center">{{ $t('common.time') }}</v-col>
                    <v-col cols="4" align="center">{{ $t('common.vacancies') }}</v-col>
                  </v-row>
                  <v-row>
                    <v-col
                        v-bind:key="item.id"
                        v-for="item in available.itens">

                      <transition-group name="room" tag="div">
                        <v-row v-for="timetable in item.timetables"
                               v-bind:key="timetable.id"

                        >
                          <v-col cols="4" align="center">{{ timetable.start }}</v-col>
                          <v-col cols="4" align="center">{{ badgeText(timetable) }}</v-col>
                          <v-col cols="4" align="center">
                            <v-btn
                                tile
                                block
                                :disabled="!timetable.available"
                                @click="chooseTimetable(timetable)"
                                v-bind:class="{ 'green':  timetable == timetable.id }"
                            >
                              {{ $t('common.select') }}
                            </v-btn>
                          </v-col>

                        </v-row>
                      </transition-group>
                    </v-col>
                  </v-row>
                </v-card>
              </transition>
            </v-col>
          </v-row>
          <v-btn text @click="step = 1">{{ $t('common.back') }}</v-btn>
        </v-stepper-content>

        <v-stepper-content step="3">
          <v-row>
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
          </v-row>
          <v-card-actions>
            <v-btn text @click="step = 2">{{ $t('common.back') }}</v-btn>
            <v-spacer></v-spacer>
            <v-btn
                right
                color="primary"
                @click="save">
              {{ $t('common.confirm') }}
            </v-btn>
          </v-card-actions>

        </v-stepper-content>
      </v-stepper-items>
    </v-stepper>
  </v-container>
</template>

<script>


import Room from "@/resources/external/Room";
import Schedule from "@/resources/external/Schedule";
 import moment from "moment";

export default {
  name: "view",
  components: {},
  data() {
    return {
      hash: null,
      company: null,
      room: null,
      language: 'en',
      day: null,
      timetable: null,

      schedule: Schedule.new(),
      maxVacancies: 100,

      vacancyLoader: {loading: false},
      path: process.env.VUE_APP_IMAGE_PATH_ROOMS,

      rooms: {type: Array, itens: []},
      available: {type: Array, itens: []},
      step: 1
    }
  },

  /* Validations from resource */
  validations: {
    schedule: Schedule.validations()
  },

  /* Computed fields */
  computed: {
    colsImages() {
      return 12 / this.rooms.itens.length
    }
  },

  methods: {

    /**
     *  Color of the badge
     * @returns string
     */
    badgeColor(timetable) {
      if (!timetable.available) return 'red'
      if (timetable.busy) return 'yellow'
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
     * Opt for room
     * @returns void
     */
    chooseRoom(room) {
      this.room = room.id
      this.step = 2
      this.availableTimetables()
    },


    /**
     * Opt for room
     * @returns void
     */
    chooseDay() {
      this.availableTimetables()
    },

    /**
     *  Choose a timetable
     * @returns void
     */
    chooseTimetable(timetable) {
      this.timetable = timetable // local to calculate values
      this.step = 3
      this.schedule.timetable.room_id = timetable.room_id
      this.schedule.timetable_id = timetable.id
      this.maxVacancies = timetable.vacancies
      this.schedule.quantity = this.schedule.quantity > timetable.vacancies ? timetable.vacancies : this.schedule.quantity
    },

    /**
     * Refresh the available time
     * @returns void
     */
    availableTimetables() {
      Room.get({
        params: {company: this.company, hash: this.hash, available: true, date: this.day},
        loader: this.vacancyLoader,
        supply: this.available.itens
      }).then(() => {
        this.available.itens = this.available.itens.filter(room => room.id == this.room)
      })
    },

    /**
     * Refresh the available time
     * @returns void
     */
    save() {
      this.schedule.day = this.day
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
     * Refresh active rooms
     * @returns void
     */
    activeRooms() {
      Room.get({
        params: {company: this.company, hash: this.hash},
        loader: true,
        supply: this.rooms.itens
      })
    },
  },

  /**
   *  hash = 5a51505bc25093245515bdbeb45506fc
   *  company = 1
   *  room = optional
   *  language = option (default en)
   */
  mounted() {

    this.language = !this.$route.query.language ?? this.language
    this.$vuetify.lang.current = this.language
    //this.language ||= this.$route.query.language;

    this.hash = this.$route.query.hash
    this.company = this.$route.query.company
    this.room = this.$route.query.room

    this.room = 1

    this.activeRooms()
    this.day = moment().format(this.$i18n.t('database.date'))

  }

}
</script>
<style>

.card-enter-active, .card-leave-active {
  transition: all 1s;
}

.card-enter, .card-leave-to {
  opacity: 0;
  transform: translateY(30px);
}


</style>