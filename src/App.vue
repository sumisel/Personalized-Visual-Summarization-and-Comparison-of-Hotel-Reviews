<script setup>
import HotelOverview from "./components/HotelOverview.vue";
import Personalization from "./components/Personalization.vue";

import { storeToRefs } from 'pinia'
import { useCategoryStore } from './stores/category.js'
const { categories } = storeToRefs(useCategoryStore())
</script>

<template>
  <v-app>
    <v-app-bar title="Hotel Review Comparison"></v-app-bar>
    <v-navigation-drawer expand-on-hover rail>
      <v-list>
          <v-list-item title="Selected hotels" prepend-icon="mdi-bookmark-box-multiple"></v-list-item>
          <v-divider></v-divider>
          <v-list-item v-for="category in categories" :key="category.id"
            :title="category.title"
            :prepend-icon="category.icon"
          ></v-list-item>
        </v-list>
    </v-navigation-drawer>
    <v-navigation-drawer permanent location="right" width="344"
      ><Personalization
    /></v-navigation-drawer>
    <v-main class="ma-6">
      <HotelOverview />

    </v-main>
  </v-app>
</template>

<style scoped>
</style>
