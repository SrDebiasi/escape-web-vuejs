<template>
  <v-row justify="center">
    <v-dialog v-model="value.visible" persistent max-width="600px">
      <v-card>
        <v-card-title>
          <span class="headline">{{ $tc('room.add-or-edit', (room.id ? 0 : 1)) }} </span>
          <v-layout justify-end>
            <v-switch
                v-model="room.enable"
                :label="`${room.enable ? $t('common.enabled') :  $t('common.disabled')}`"
                color="rgb(38,109,41)"
            ></v-switch>
          </v-layout>
        </v-card-title>
        <v-card-text>
          <v-container>
            <v-row>
              <v-col cols="12" sm="12" md="12">
                <v-text-field
                    :label="$t('room.labels.name')"
                    v-model.trim="room.name"
                    :error-messages="($v.room.name.$invalid && $v.room.name.$dirty) ? $t('form.field_required') : ''"
                    @input="$v.room.name.$touch"
                    required></v-text-field>
              </v-col>
              <v-col cols="6" sm="12" md="6">
                <v-text-field
                    :label="$t('room.labels.short_name')"
                    v-model.trim="room.short_name"
                    :error-messages="($v.room.short_name.$invalid && $v.room.short_name.$dirty) ? $t('form.field_required') : ''"
                    @input="$v.room.short_name.$touch"
                    required></v-text-field>
              </v-col>
              <v-col cols="6" sm="12" md="6">
                <v-select
                    :label="$t('room.labels.schedule_types')"
                    v-model="room.schedule_type"
                    :items="scheduleType"
                    :hint="scheduleTypeHint"
                    :error-messages="($v.room.schedule_type.$invalid && $v.room.schedule_type.$dirty) ? $t('form.field_required') : ''"
                    persistent-hint
                ></v-select>
              </v-col>
              <v-col cols="12" sm="12" md="12" class="mt-5">
                <v-slider
                    :label="$t('room.labels.play_time')"
                    v-model="room.play_time"
                    :error-messages="($v.room.play_time.$invalid && $v.room.play_time.$dirty) ? $t('form.field_required') : ''"
                    @input="$v.room.play_time.$touch"
                    :hint="$t('room.labels.play_time_hint')"
                    persistent-hint
                    step="1"
                    min="15"
                    max="120"
                    thumb-label="always"
                ></v-slider>
              </v-col>
              <v-col cols="12" sm="12" md="12" class="mt-5">
                <v-slider
                    v-model="room.vacancies"
                    :label="$t('room.labels.vacancies')"
                    :hint="$t('room.labels.vacancies_hint')"
                    :error-messages="($v.room.vacancies.$invalid && $v.room.vacancies.$dirty) ? $t('form.field_required') : ''"
                    @input="$v.room.vacancies.$touch"
                    persistent-hint
                    step="1"
                    min="1"
                    max="20"
                    thumb-label="always"
                    ticks
                ></v-slider>
              </v-col>
              <v-col cols="6">
                <v-currency-field
                    v-model="room.room_price"
                    :label="$t('room.labels.room_price')"
                    :hint="$t('room.labels.room_price_hint')"
                    :prefix="$t('currency.prefix')"
                    required/>
              </v-col>
              <v-col cols="6">
                <v-currency-field
                    v-model="room.ticket_price"
                    :label="$t('room.labels.ticket_price')"
                    :hint="$t('room.labels.ticket_price_hint')"
                    :prefix="$t('currency.prefix')"
                    required>
                </v-currency-field>
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
import Room from '@/resources/Room'

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

  data() {
    return {
      changes: false,
      room: Room.new(),
      //Two types available
      scheduleType: [
        {'value': 1, 'text': this.$i18n.t('room.labels.ticket'), 'hint': this.$i18n.t('room.labels.ticket_hint')},
        {'value': 2, 'text': this.$i18n.t('room.labels.room'), 'hint': this.$i18n.t('room.labels.room_hint')},
      ],
      // money       : MoneyHelper.config
    }
  },

  /* Validations from resource */
  validations: {
    room: Room.validations()
  },

  created() {

  },

  /* Methods: save, edit, close */
  methods: {

    /**
     *  save - use to save the resource
     * @returns void
     */
    save() {
      this.$v.$touch()
      if (this.$v.$invalid) {
        this.$toast.error(this.$i18n.t('form.invalid_fields'))
        return
      }

      this.$v.$reset()
      Room.save({
        params: this.room,
        loader: true
      }).then(() => {
        this.$toast.success(this.$i18n.t('message.save.success', {resource: this.$i18n.t('common.room')}))
        this.changes = true
        this.close()
      });
    },

    /**
     *  close -  close the modal
     * @returns void
     */
    close() {
      this.$emit('requestClose', {changes: this.changes})
      this.room = Room.new()
      this.changes = false
    },

    /**
     *  Search the room
     * @returns void
     */
    find() {
      if (this.value.id)
        Room.show({
          params: {id: this.value.id},
          loader: true,
          supply: this.room,
        });
    },


  },

  /* Computed fields */
  computed: {

    /**
     *  Return the hint of the object scheduleType selected
     * @returns {string}
     */
    scheduleTypeHint() {
      return this.scheduleType.find(e => e.value === this.room.schedule_type).hint
    },

  },

  /* Watch the value.id from list*/
  watch: {
    'value.id'() {
      this.find()
    }
  },

}
</script>