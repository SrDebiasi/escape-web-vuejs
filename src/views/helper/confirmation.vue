<template>
  <v-row justify="center">
    <v-dialog v-model="visible" persistent max-width="290">
      <v-card>
        <v-card-title class="headline">{{title}}</v-card-title>
        <v-card-text>{{message}}
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="red" text @click="refuse">{{$t(disagree)}}</v-btn>
          <v-btn color="green darken-1" text @click="accept">{{$t(agree)}}</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-row>
</template>

<script>

  module.exports = {
    props:
      {
        visible : false,
        title   : String,
        message : String,
        agree   : {
          type   : String,
          default: 'common.agree'
        },
        disagree: {
          type   : String,
          default: 'common.disagree'
        },
      },


    methods: {
      refuse()
      {
        this.$emit('requestCloseDisagree', {})
      },

      accept()
      {
        this.$emit('requestCloseAgree', {})
      },
    },
  };
</script>