<script setup>
import HotelOverview from "./components/HotelOverview.vue";
import Personalization from "./components/Personalization.vue";
</script>

<template>
  <v-app>
    <v-app-bar title="Hotel Review Comparison"></v-app-bar>
    <v-navigation-drawer color="grey-darken-2" permanent location="right" width="344"><Personalization /></v-navigation-drawer>
    <v-main>
      <v-content><HotelOverview /></v-content>
    </v-main>
  </v-app>
</template>

<style scoped>
</style>
