<script setup>
import { storeToRefs } from 'pinia'
import { useHotelsStore } from '../stores/hotels.js'
const { hotels } = storeToRefs(useHotelsStore())
</script>

<template>
  <div class="text-h4">Selected Hotels</div>
  <div class="d-flex flex-row flex-wrap">
    <v-card
      v-for="hotel in hotels"
      :key="hotel.id"
      :title="`${hotel.id}: ${hotel.name}`"
      :subtitle="hotel.statement"
      text="..."
      class="ma-2 flex-grow-1"
    ></v-card>
  </div>
</template>

<script>
</script>
