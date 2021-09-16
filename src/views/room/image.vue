<template>
  <v-row justify="center">
    <v-dialog v-model="value.visible" persistent max-width="600px">
      <v-card>
        <v-card-title>
          <span class="headline">{{$t('room.labels.upload_file')}}</span>
        </v-card-title>
        <v-card-text>
          <v-container>
            <template>
              <v-file-input
                  :label="$t('room.labels.file_input')"
                  accept="image/*"
                  @change="save"
                  v-model="file"
                  prepend-icon="mdi-camera"
              ></v-file-input>
            </template>

            <v-fade-transition mode="out-in">
              <v-row v-if="room.picture_large" key="0">
                <v-col cols="12">
                  <v-card>
                    <v-img
                        :src="path + image"
                        height="300"
                        class="grey darken-4"
                    ></v-img>
                  </v-card>
                </v-col>
              </v-row>
            </v-fade-transition>
          </v-container>

        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn @click="close">{{ $t('common.close') }}</v-btn>
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
        type   : Object,
        default: () => ({
          visible: false,
          id     : null,
        }),
      }
    },

    data()
    {
      return {
        changes: false,
        file   : null,
        image  : null,
        path   : process.env.VUE_APP_IMAGE_PATH_ROOMS,
        room   : Room.new(),
      }
    },

    created()
    {

    },

    /* Methods: save, edit, close */
    methods: {

      save()
      {
        if(!this.file)
        {
          this.$toast.error(this.$i18n.t('form.invalid_fields'))
          return
        }

        this.convert(this.file).then((base64) =>
        {
          this.room.picture_large = base64
          this.room.saveImage = true //server side know that need to convert
          Room.save({
            params: this.room,
            loader: true,
            supply: this.room,
          }).then(() =>
          {
            this.image = this.room.picture_large + '?rnd=' + Math.random()
            this.$toast.success(this.$i18n.t('message.save.success', {resource: this.$i18n.t('common.picture')}))
          });
        })


      },

      async convert(image)
      {
        const toBase64 = file => new Promise((resolve, reject) =>
        {
          const reader = new FileReader();
          reader.readAsDataURL(file);
          reader.onload = () => resolve(reader.result);
          reader.onerror = error => reject(error);
        });

        const file = image;
        return await toBase64(file);
      },


      /**
       *  close -  close the modal
       * @returns void
       */
      close()
      {
        this.$emit('requestClose', {changes: this.changes})
        this.room = Room.new()
        this.changes = false
      }
      ,

      /**
       *  Find the room
       * @returns void
       */
      find()
      {
        if(this.value.id)
          Room.show({
            params: {id: this.value.id},
            loader: true,
            supply: this.room,
          }).then(() =>
          {
            //Do not access the property because its changes through base64 and api path image
            this.image = this.room.picture_large
          });
      }
      ,

    },

    /* Computed fields */
    computed: {}
    ,

    /* Watch the value.id from list*/
    watch: {
      'value.id'()
      { this.find() }
    }
    ,

  }
</script>