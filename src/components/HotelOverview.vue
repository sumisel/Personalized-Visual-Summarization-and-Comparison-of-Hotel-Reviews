<script>
import HotelRating from "./HotelRating.vue";
import { useHotelStore } from "../stores/hotel.js";
import { useCategoryStore } from "../stores/category.js";

export default {
  components: {
    HotelRating,
  },
  setup() {
    const hotelStore = useHotelStore();
    const categoryStore = useCategoryStore();
    return { hotelStore, categoryStore };
  },
  computed: {
    ratingVarietyDescription() {
      const minRatings = this.hotelStore.minRatings;
      const maxRatings = this.hotelStore.maxRatings;
      const normalizedCategoryValues =
        this.categoryStore.normalizedCategoryValues;
      const variety = Object.keys(minRatings).reduce(
        (sum, categoryId) =>
          (sum +=
            Math.abs(minRatings[categoryId] - maxRatings[categoryId]) *
            normalizedCategoryValues[categoryId]),
        0
      );
      return variety > 0.99 ? "somewhat differently" : "quite similarly";
    },
  },
};
</script>

<template>
  <div class="ml-12">
    <p>
      Customers have rated the
      <b
        ><span>{{ hotelStore.hotels.length }}</span></b
      >
      selected hotels <b>{{ ratingVarietyDescription }}</b> with respect to the
      prioritized categories.
    </p>
    <div class="d-flex flex-column hotel-list my-4">
      <HotelRating
        v-for="hotel in hotelStore.hotels"
        :key="hotel.id"
        :hotel="hotel"
      ></HotelRating>
      <v-label class="ml-4"
        >Rating weighted by priorities <v-icon icon="mdi-arrow-right"></v-icon
      ></v-label>
    </div>
  </div>
</template>

<style>
.hotel-list {
  border-left: 1px solid black;
}
</style>