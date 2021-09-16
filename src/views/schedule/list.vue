<template>
  <v-container fluid>

    <!-- Schedule configConfirmed -->
    <v-dialog
        v-model="configDialog"
        width="500">
      <v-card>
        <v-card-title class="headline">
          {{ $t('schedule.labels.options') }}
        </v-card-title>
        <v-list flat subheader>
          <v-list-item-group multiple>
            <v-list-item>
              <template>
                <v-list-item-content>
                  <v-list-item-title>{{ $t('room.configuration.labels.simultaneous') }}</v-list-item-title>
                  <v-list-item-subtitle>{{ $t('room.configuration.labels.accept_simultaneous') }}</v-list-item-subtitle>
                </v-list-item-content>
                <v-list-item-action>
                  <v-switch v-model="configConfirmed.value" color="green" @change="configSave()"
                  ></v-switch>
                </v-list-item-action>
              </template>
            </v-list-item>
          </v-list-item-group>
        </v-list>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn @click="configDialog = false">{{ $t('common.close') }}</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>


    <!-- Sumamry -->
    <v-card
        class="mx-auto"
        tile>
      <v-list-item three-line>
        <v-list-item-content>
          <v-list-item-title>{{ $t('common.summary') }}</v-list-item-title>
          <v-list-item-subtitle v-show="!loader.loading">
            {{ $tc('schedule.summary', confirmedSchedules, {schedulesAmount: confirmedSchedules}) }}
          </v-list-item-subtitle>
        </v-list-item-content>

        <v-list-item-action>
          <v-btn icon>
            <v-icon color="grey lighten-1" @click="configDialog = true">mdi-cog</v-icon>
          </v-btn>
        </v-list-item-action>
      </v-list-item>
    </v-card>

    <!-- Search -->
    <v-card-title>
      <v-row>
        <v-col md="6" sm="12">
          <v-text-field

              :label="$t('common.search')"
              v-model="search.text"
              hide-details
          ></v-text-field>
        </v-col>
        <v-col md="6" sm="12">
          <v-menu
              ref="menuDate"
              v-model="menuDate"
              :close-on-content-click="false"
              :return-value.sync="search.day"
              transition="scale-transition"
              offset-y
              min-width="290px"
          >
            <template v-slot:activator="{ on, attrs }">
              <v-text-field
                  v-model="formattedDate"
                  :label="$t('common.date')"
                  @blur="filterDate"
                  v-bind="attrs"
                  v-on="on"
                  append-icon="mdi-magnify"
                  hide-details
              ></v-text-field>
            </template>
            <v-date-picker
                :locale="$t('locale')"
                v-model="search.day"
                scrollable
            >
              <v-btn text color="primary" @click="$refs.menuDate.save(null)">{{ $t('common.clear') }}</v-btn>
              <v-btn text color="primary" @click="$refs.menuDate.save(search.day);">{{ $t('common.save') }}</v-btn>
            </v-date-picker>
          </v-menu>
        </v-col>
      </v-row>
    </v-card-title>

    <!-- Table -->
    <v-data-table
        :headers="headers"
        :items="schedules.itens"
        :items-per-page="10"
        :loading="loader.loading"
        v-model="selected"
        class="elevation-1"
        show-select
        single-select
        hide-default-footer
        @click:row="edit"
    >
      <template v-slot:item.name="{ item }">
        {{ item.name | capitalize_all }}
      </template>
      <template v-slot:item.phone="{ item }">
        {{ item.phone | VMask($t('phone.mask')) }}
      </template>

      <template v-slot:item.day="{ item }">
        {{ moment({data: item.day, mask: $t('dates.date')}) }}
      </template>
    </v-data-table>

    <!-- Float Buttons -->
    <v-fab-transition>
      <v-btn color="success" fab bottom fixed left v-show="!hasSelected" @click="open">
        <v-icon>mdi-plus</v-icon>
      </v-btn>
    </v-fab-transition>

    <v-fab-transition>
      <v-btn color="success" fab bottom fixed left v-show="hasSelected" @click="edit">
        <v-icon>mdi-pencil</v-icon>
      </v-btn>
    </v-fab-transition>

    <v-fab-transition>
      <v-btn color="red" fab bottom fixed left v-show="hasSelected" class="ml-70" @click="confirmDestroy">
        <v-icon>mdi-delete</v-icon>
      </v-btn>
    </v-fab-transition>

    <!-- Modal/Dialog components -->
    <vi-schedule-save v-model="modalSchedule" v-on:requestClose="closeSchedule"/>

    <!-- Confirmation delete -->
    <vi-confirmation :visible="confirmDelete" title="Yes" :message="$t('common.are_you_sure')"
                     v-on:requestCloseAgree="destroy"
                     v-on:requestCloseDisagree="confirmDelete = false"></vi-confirmation>

  </v-container>
</template>

<script>

import Schedule from '@/resources/Schedule'
import User from '@/resources/User'
import Info from "@/resources/Info";

import moment from 'moment';

export default {
  name: "schedule",
  components: {
    viScheduleSave: () => import('@/views/schedule/save'),
    viConfirmation: () => import('@/views/helper/confirmation'),
  },
  data() {
    return {

      configConfirmed: Info.new(),
      configDialog: false,

      search: {
        text: '',
        room: '',
        day: null,
      },

      menuDate: false,

      selected: [],
      confirmDelete: false,

      modalSchedule: {visible: false, id: null},

      schedules: {type: Array, itens: []},
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

  computed: {

    /**
     * Has any row selected?
     * @returns {boolean}
     */
    hasSelected() {
      return this.selected.length > 0
    },

    /**
     * Search date formated
     * @returns {boolean}
     */
    formattedDate() {
      return this.search.day == null ? null : moment(this.search.day).format(this.$i18n.t('dates.date'))
    },


    /**
     * Confirmed schedules of the day
     * @returns {boolean}
     */
    confirmedSchedules() {
      return this.schedules.itens.filter(schedule => (schedule.confirmed == 1 && schedule.day == moment().format(this.$i18n.t('database.date')))).length
    },


  },

  methods: {

    /**
     * Refresh the data
     * @returns void
     */
    refresh() {
      Schedule.get({
        params: {company_id: User.command('get.company').id},
        loader: this.loader,
        supply: this.schedules.itens
      }).then(() => {
        //After refresh, clean all the selected values
        this.selected = []
      })
    },

    /**
     * Set the id to the modalSchedule form
     * @returns void
     */
    edit(value) {
      this.modalSchedule.id = value.id
      this.open()
    },

    /**
     * Confirm delete
     * @returns void
     */
    confirmDestroy() {
      this.confirmDelete = true
    },

    /**
     * Delete the resource (plus refresh the table)
     * @returns void
     */
    destroy() {
      this.confirmDelete = false
      Schedule.delete({
        params: {id: this.selected[0].id},
        loader: this.loader,
      }).then(() => {
        this.refresh()
      })
    },

    /**
     * Open the modalSchedule
     * @returns void
     */
    open() {
      this.modalSchedule.visible = true
    },

    /**
     * Close the modalSchedule (plus refresh the table if necessary)
     * @returns void
     * @param input (changes)
     */
    closeSchedule(data) {
      if (data.changes) this.refresh()
      this.modalSchedule.visible = false
      this.modalSchedule.id = null
    },


    /**
     * moment
     */
    moment({data, mask}) {
      return moment(data).format(mask)
    },

    /**
     * Filter for texts on table
     * @param value Value to be tested.
     * @returns {boolean}
     */
    stringFilter(value, filter, item) {
      if (!this.search.text)
        return true;

      return item.name.toLowerCase().includes(this.search.text.toLowerCase()) ||
          item.timetable.room.name.toLowerCase().includes(this.search.text.toLowerCase())
    },


    /**
     * Filter for calories column.
     * @param value Value to be tested.
     * @returns {boolean}
     */
    dayFilter(value) {
      if (!this.search.day) {
        return true;
      }
      return value === this.search.day;
    },

    configSave() {
      Info.save({params: this.configConfirmed, loader: this.loader}).then(() => {
        Info.command('refresh')
      });
    },

    /**
     * Clear date search
     * @returns void
     */
    clearDate() {
      this.search.day = null
      this.menuDate = false
    },


  },

  mounted() {
    this.refresh()

    //Get info for new Schedules - confirmed default
    Info.get({
      params: {
        company_id: User.command('get.company').id,
        name: 'schedule-new-confirmed-default',
        force: true,
        default: 1,
      },
      supply: this.configConfirmed,
      promote: true
    })
  }
}
</script>

<style>
.today-appoitment {
  background-color: green;
}

</style>