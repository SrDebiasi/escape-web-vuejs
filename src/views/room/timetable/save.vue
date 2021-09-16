<template>
  <v-dialog v-model="value.visible" persistent max-width="1100px">
    <v-card :loading="loader.loading">
      <v-row class="d-flex" no-gutters>
        <v-col sm="12" md="4">
          <v-time-picker
              v-model="timetable.start"
              :disabled="disabled"
              ampm-in-title
              ref="picker"
              format="24hr"
              required
              elevation="0"
              full-width
              :allowed-minutes="allowedStep"
              style="box-shadow: none"
          ></v-time-picker>
        </v-col>

        <v-col sm="12" md="8">
          <v-list>
            <v-list-item-group>
              <v-list-item inactive dense>
                <v-list-item-content>
                  <v-list-item-title>{{ $t('room.timetable.beginning_appointment') }}</v-list-item-title>
                </v-list-item-content>

              </v-list-item>
            </v-list-item-group>
          </v-list>

          <v-list flat>
            <v-list-item-group>
              <transition-group name="list" tag="p">
                <v-list-item v-for="(item, i) in room.timetables"
                             v-bind:key="item.id"
                             @click.prevent="edit(item)"
                             class="list-item">

                  <v-list-item-action v-bind:key="item.id">
                    {{ item.start }}
                  </v-list-item-action>

                  <v-list-item-content v-bind:key="item.id">
                    <v-select
                        v-model="item.days"
                        :items="days"
                        item-text="name"
                        item-value="value"
                        multiple
                        @change="changes = true"
                        return-object
                    >
                      <template v-slot:selection="{ attrs, item, select, selected }">
                        <v-chip
                            v-bind="attrs"
                            :input-value="selected"
                            @click="select"
                        >{{ $t('days.' + item.short) }}
                        </v-chip>
                      </template>
                    </v-select>
                  </v-list-item-content>

                  <v-list-item-action>
                    <v-switch
                        color="green"
                        v-model="item.enable"
                    ></v-switch>
                  </v-list-item-action>

                  <v-list-item-action>
                    <v-icon
                        @click.stop="destroy(item, i)">
                      mdi-delete
                    </v-icon>
                  </v-list-item-action>

                </v-list-item>
              </transition-group>
            </v-list-item-group>
          </v-list>
        </v-col>
      </v-row>
    </v-card>
    <v-card>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn @click="add" color="success">{{
            this.timetable.id == null ? $t('common.add') : $t('common.save')
          }}
        </v-btn>
        <v-btn @click="cancel" v-show="this.timetable.id != null">{{ $t('common.cancel') }}</v-btn>
        <v-btn @click="close">{{ $t('common.close') }}</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

</template>

<script>
import Room from '@/resources/Room'
import Timetable from '@/resources/Timetable'

export default {
  props: {
    value: {
      type: Object,
      default: () => ({
        visible: false,
        roomId: null,
      }),
    }
  },

  data() {
    return {
      disabled: false,
      changes: false,
      timetable: Timetable.new(),
      loader: {loading: false},
      room: Room.new(),
      days: [
        {name: this.$i18n.t('days.sunday'), short: 'sun', value: "0"},
        {name: this.$i18n.t('days.monday'), short: 'mon', value: "1"},
        {name: this.$i18n.t('days.tuesday'), short: 'tue', value: "2"},
        {name: this.$i18n.t('days.wednesday'), short: 'wed', value: "3"},
        {name: this.$i18n.t('days.thursday'), short: 'thu', value: "4"},
        {name: this.$i18n.t('days.friday'), short: 'fri', value: "5"},
        {name: this.$i18n.t('days.saturday'), short: 'sat', value: "6"}
      ],
    }
  },


  created() {
  },

  methods: {
    allowedStep: m => m % 5 === 0,

    /**
     * Add
     * @returns void
     */
    add() {
      if (this.timetable.start == null) {
        this.$toast.error(this.$i18n.t('form.invalid_fields'))
        return
      }
      let isNew = this.timetable.id == null;
      this.timetable.days = this.timetable.days.join(',')
      this.timetable.room_id = this.room.id;
      Timetable.save({
        params: this.timetable,
        supply: this.timetable, //Return id to the object
        loader: this.loader
      }).then(() => {
        this.timetable.days = this.timetable.days.split(',')
        if (isNew) this.timetables.push(this.timetable)
        this.sort()
        this.timetable = Timetable.new();
      });
    },

    /**
     * Cancel editing
     * @returns void
     */
    cancel() {
      this.timetable = Timetable.new();
    },

    /**
     * Edit method
     * @returns void
     */
    edit(timetable) {
      if (this.changes) this.$toast.error(this.$i18n.t('form.save_or_discard_changes'))
      this.timetable = timetable
    },

    /**
     * Sort timetable by time
     * @returns void
     */
    sort() {
      this.timetables.sort((a, b) => parseInt(a.start.replace(':', '')) - parseInt(b.start.replace(':', '')))
    },

    /**
     * Show room
     * @returns void
     */
    show() {
      if (this.value.roomId)
        Room.show({
          params: {id: this.value.roomId},
          loader: true,
          supply: this.room,
        }).then(() => {
          this.room.timetables.forEach(timetable => timetable.days = timetable.days.split(','))
          this.timetables = this.room.timetables
          this.sort()
        });
    },

    /**
     * Close modal
     * @returns void
     */
    close() {
      this.room = Room.new()
      this.$emit('requestClose', {})
    },

    /**
     * Remove day chip
     * @returns void
     */
    remove(item) {
      this.chips.splice(this.chips.indexOf(item), 1)
      this.chips = [...this.chips]
    },

    /**
     * Destroy the timetable
     * possibly exception raised by already used timetables, user must disable the time
     * @returns void
     */
    destroy(data, i) {
      Timetable.delete({
        params: {id: data.id},
        loader: this.loader,
      }).then(() => {
        this.timetables.splice(i, 1)
      })
    },

  },


  /* Watches */
  watch: {
    'value.roomId'() {
      this.show()
    },
    'value.visible'() {
      if (this.value.visible)
        this.timetable = Timetable.new();

    }
  },

}
</script>
<style>
.theme--dark.v-picker__body {
  background-color: inherit;
}

.list-item {
  margin-right: 10px;
}

.list-enter-active, .list-leave-active {
  transition: all 1s;
}

.list-enter, .list-leave-to {
  opacity: 0;
  transform: translateX(-30px);
}
</style>