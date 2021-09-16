<template>
  <v-container fluid>

    <!-- Room Config -->
    <v-dialog
        v-model="configDialog"
        width="500">
      <v-card>
        <v-card-title class="headline">
          {{ $t('room.labels.options') }}
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
                  <v-switch
                      v-model="config.value"
                      color="green"
                      @change="configSave()"
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
          <v-list-item-subtitle v-show="!loader.loading">{{
              $tc('room.summary', activeRooms.length, {
                activeRooms: activeRooms.length, not: !config.value ?$t('common.not') : ''})
            }}
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
      <v-text-field
          v-model="search"
          append-icon="mdi-magnify"
          :label="$t('common.search')"
      ></v-text-field>
    </v-card-title>

    <!-- Table -->
    <v-data-table
        :headers="headers"
        :items="rooms.itens"
        :items-per-page="10"
        :loading="loader.loading"
        :search="search"
        v-model="selected"
        class="elevation-1"
        show-select
        single-select
        hide-default-footer
        disable-pagination
        @click:row="edit"
    >
      <template v-slot:item.enable="{ item }">
        <v-chip
            class="mr-5" small :color="item.enable ? 'green' : 'red'" dark>{{ $t('boolean.' + item.enable) }}
        </v-chip>
      </template>
      <template v-slot:item.timetable="{ item }">
        <v-icon
            class="mr-5"
            @click.stop="editTimetable(item)">
          mdi-calendar-clock
        </v-icon>
      </template>
      <template v-slot:item.image="{ item }">
        <v-icon
            class="mr-5"
            @click.stop="editImage(item)">
          mdi-image
        </v-icon>
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
    <vi-room-save v-model="modalRoom" v-on:requestClose="closeRoom"/>
    <vi-room-image v-model="modalRoomImage" v-on:requestClose="closeRoomImage"/>
    <vi-room-timetable-save v-model="modalRoomTimetable" v-on:requestClose="closeTimetable"/>

    <!-- Confirmation delete -->
    <vi-confirmation :visible="confirmDelete" title="Yes" :message="$t('common.are_you_sure')"
                     v-on:requestCloseAgree="destroy"
                     v-on:requestCloseDisagree="confirmDelete = false"></vi-confirmation>

  </v-container>
</template>

<script>
import Info from '@/resources/Info'
import Room from '@/resources/Room'
import User from '@/resources/User'


export default {
  name: "room",
  components: {
    viRoomSave: () => import('@/views/room/save'),
    viRoomImage: () => import('@/views/room/image'),
    viRoomTimetableSave: () => import('@/views/room/timetable/save'),
    viConfirmation: () => import('@/views/helper/confirmation'),
  },
  data() {
    return {
      search: '',
      selected: [],

      configDialog: false,
      confirmDelete: false,
      config: Info.new(),

      modalRoom: {visible: false, id: null},
      modalRoomImage: {visible: false, id: null},

      modalRoomTimetable: {visible: false, roomId: null},

      rooms: {type: Array, itens: []},
      loader: {loading: false},

      headers: [
        {text: this.$i18n.t('room.labels.name'), align: 'start', sortable: false, value: 'name'},
        {text: this.$i18n.t('room.labels.active'), align: 'center', value: 'enable'},
        {text: this.$i18n.t('room.labels.timetable'), align: 'center', value: 'timetable', width: 150},
        {text: this.$i18n.t('room.labels.image'), align: 'center', value: 'image', width: 150},
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
     * Active rooms
     * @returns {array}
     */
    activeRooms() {
      return this.rooms.itens.filter(room => room.enable === true)
    }
  },

  methods: {

    /**
     * Refresh the data
     * @returns void
     */
    refresh() {
      Room.get({
        params: {company_id: User.command('get.company').id},
        loader: this.loader,
        supply: this.rooms.itens
      }).then(() => {
        //After refresh, clean all the selected values
        this.selected = []
      })
    },

    /**
     * Set the id to the modalRoom form
     * @returns void
     */
    edit(value) {
      this.modalRoom.id = value.id
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
      Room.delete({
        params: {id: this.selected[0].id},
        loader: this.loader,
      }).then(() => {
        this.refresh()
      })
    },

    /**
     * Open the modalRoom
     * @returns void
     */
    open() {
      this.modalRoom.visible = true
    },

    /**
     * Close the modalRoom (plus refresh the table if necessary)
     * @returns void
     * @param input (changes)
     */
    closeRoom(data) {
      if (data.changes) this.refresh()
      this.modalRoom.visible = false
      this.modalRoom.id = null
    },

    /**
     * Close the modal of image select of a room
     * @returns void
     * @param input (changes)
     */
    closeRoomImage() {
      this.modalRoomImage.visible = false
      this.modalRoomImage.id = null
    },

    /**
     * Close the modalRoom (plus refresh the table if necessary)
     * @returns void
     * @param input (changes)
     */
    closeTimetable() {
      this.modalRoomTimetable.visible = false
      this.modalRoomTimetable.roomId = null
    },

    /**
     * Timetable of the room
     * @returns void
     * @param input (changes)
     */
    editTimetable(value) {
      this.modalRoomTimetable.roomId = value.id
      this.modalRoomTimetable.visible = true
    },


    /**
     * Timetable of the room
     * @returns void
     * @param input (changes)
     */
    editImage(value) {
      this.modalRoomImage.id = value.id
      this.modalRoomImage.visible = true
    },

    /**
     * Save config
     * @returns void
     */
    configSave() {
      Info.save({params: this.config, loader: this.loader});
    },
  },

  mounted() {
    this.refresh()

    Info.get({
      params: {
        company_id: User.command('get.company').id,
        name: 'room-simultaneous',
        force: true
      },
      loader: this.loader,
      supply: this.config,
      promote: true
    })
  }
}
</script>