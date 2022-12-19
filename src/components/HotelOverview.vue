<script>
import Glyph from "./Glyph.vue";
import CategoryName from "./CategoryName.vue";
import { useHotelStore } from "../stores/hotel.js";

export default {
  components: {
    Glyph,
    CategoryName,
},
  setup() {
    const hotelStore = useHotelStore();
    return { hotelStore };
  },
};
</script>

<template>
  <div class="d-flex flex-column">
    <v-card
      v-for="hotel in hotelStore.hotels"
      :key="hotel.id"
      class="ma-2 flex-grow-1 w-50"
      :style="`margin-left: ${hotelStore.overallRating(hotel)*100}px !important;`"
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
          <v-card-text v-if="hotelStore.isClearlyBest(hotel).length">
            Clearly the best <CategoryName :categoryId="hotelStore.isClearlyBest(hotel)[0]"></CategoryName>
          </v-card-text>
        </div>
      </div>
    </v-card>
  </div>
</template>

<style scoped>
.v-avatar {
  width: 100px !important;
  height: 100px !important;
}
</style>
