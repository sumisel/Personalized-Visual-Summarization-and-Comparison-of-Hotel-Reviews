<script setup>
import Glyph from "./Glyph.vue";

import { storeToRefs } from "pinia";
import { useHotelStore } from "../stores/hotel.js";
const { hotels } = storeToRefs(useHotelStore());
</script>

<template>
  <div class="d-flex flex-row flex-wrap">
    <v-card v-for="hotel in hotels" :key="hotel.id" class="ma-2 flex-grow-1"
      ><div class="d-flex flex-no-wrap justify-space-between">
        <v-avatar class="ma-3 flex-grow-0" size="125" rounded="0">
          <Glyph :ratings="hotel.ratings"></Glyph>
        </v-avatar>
        <div class="flex-grow-1">
          <v-card-title class="text-h5"
            >{{ hotel.id }}: {{ hotel.name }}</v-card-title
          >
          <v-card-subtitle>{{ hotel.statement }}</v-card-subtitle>
        </div>
      </div>
    </v-card>
    <v-card> </v-card>
  </div>
</template>

<script>
</script>
