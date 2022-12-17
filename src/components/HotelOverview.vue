<script>
import Glyph from "./Glyph.vue";
import { useHotelStore } from "../stores/hotel.js";

export default {
  components: {
    Glyph,
  },
  setup() {
    const hotelStore = useHotelStore();
    return { hotelStore };
  },
};
</script>

<template>
  <div class="d-flex flex-row flex-wrap">
    <v-card
      v-for="hotel in hotelStore.hotels"
      :key="hotel.id"
      class="ma-2 flex-grow-1"
      ><div class="d-flex flex-no-wrap justify-space-between">
        <v-avatar class="ma-3 flex-grow-0" size="125" rounded="0">
          <Glyph
            :ratings="hotel.ratings"
            :minRatings="hotelStore.minRatings"
          ></Glyph>
        </v-avatar>
        <div class="flex-grow-1">
          <v-card-title class="text-h5"
            >{{ hotel.id }}: {{ hotel.name }}</v-card-title
          >
          <v-card-subtitle>{{ hotel.statement }}</v-card-subtitle>
        </div>
      </div>
    </v-card>
  </div>
</template>
