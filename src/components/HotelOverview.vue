<script>
import HotelRating from "./HotelRating.vue";
import { useHotelStore } from "../stores/hotel.js";

export default {
  components: {
    HotelRating,
  },
  setup() {
    const hotelStore = useHotelStore();
    return { hotelStore };
  },
};
</script>

<template>
  <div class="d-flex flex-column hotel-list ml-12 my-4">
    <HotelRating
      v-for="hotel in hotelStore.hotels"
      :key="hotel.id"
      :hotel="hotel"
    ></HotelRating>
    <v-label class="ml-4">Rating weighted by priorities <v-icon icon="mdi-arrow-right"></v-icon></v-label>
  </div>
</template>

<style>
.hotel-list {
  border-left: 1px solid black;
}
</style>