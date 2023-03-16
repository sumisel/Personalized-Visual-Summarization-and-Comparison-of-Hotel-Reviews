<script>
import CategoryPosNeg from "./CategoryPosNeg.vue";
import { useHotelStore } from "../stores/hotel.js";
import { useCategoryStore } from "../stores/category.js";

export default {
  components: {
    CategoryPosNeg,
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
    <div class="d-flex flex-column my-4">
      <CategoryPosNeg
        v-for="category in categoryStore.categories"
        :category="category"
        @mouseenter="categoryStore.hover(category.id)"
        @mouseleave="categoryStore.unhover()"
      ></CategoryPosNeg>
    </div>
  </div>
</template>

<style>
.hotel-list {
  border-left: 1px solid black;
}
</style>