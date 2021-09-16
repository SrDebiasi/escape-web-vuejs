<template>
  <v-container fluid>
    <v-row>
      <v-col>
        <vi-widget-schedules-list/>
      </v-col>
    </v-row>
    <v-row class="mt-6">
      <v-col>
        <vi-widget-schedules/>
      </v-col>
      <v-col>
        <vi-widget-timetables/>
      </v-col>
      <v-col>
        <vi-widget-revenue/>
      </v-col>
    </v-row>
    <v-row class="mt-6">
      <v-col md="4">
        <vi-summary-schedules/>
      </v-col>
      <v-col md="4">
        <vi-summary-occupancy/>
      </v-col>
      <v-col md="4">
        <vi-summary-revenue/>
      </v-col>
    </v-row>
  </v-container>
</template>
<script>
export default {
  name: 'dashboard',
  components: {
    viWidgetRevenue: () => import('@/components/dashboard/widget/revenue'),
    viWidgetSchedules: () => import('@/components/dashboard/widget/schedules'),
    viWidgetSchedulesList: () => import('@/components/dashboard/widget/schedules-list'),
    viWidgetTimetables: () => import('@/components/dashboard/widget/timetables'),
    viSummarySchedules: () => import('@/components/dashboard/summary/schedules'),
    viSummaryOccupancy: () => import('@/components/dashboard/summary/occupancy'),
    viSummaryRevenue: () => import('@/components/dashboard/summary/revenue')
  },
  data: () => ({})
}
</script>
