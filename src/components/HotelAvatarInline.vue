<script setup>
import { inject } from 'vue';

const hotelMeta = inject('hotelMeta');
const city = inject('city');

const props = defineProps({
    hotelId: {
        type: String,
        required: true
    },
})
</script>

<template>
  <div style="display: inline-block; height: 1em; width: 1em; white-space: nowrap; /* This is required unless you put the helper span closely near the img */
                        text-align: center;">
    <span style="display: inline-block; height: 100%;"></span>
    <v-avatar style="vertical-align: text-top; height: 1em; width: 1em" color="#eee" :image="`./img/hotels/${city.name
                        .replace(' ', '_')
                        .toLowerCase()}/${hotelId}.png`">
    </v-avatar>
  </div>
</template>

