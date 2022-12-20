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
  <div class="d-flex flex-column">
    <HotelRating
      v-for="hotel in hotelStore.hotels"
      :key="hotel.id"
      :hotel="hotel"
    ></HotelRating>
  </div>
</template>