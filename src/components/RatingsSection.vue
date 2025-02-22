<script>
import HotelRating from "./HotelRating.vue";
import HotelAvatarInline from "./HotelAvatarInline.vue";
import { useHotelStore } from "../stores/hotel.js";
import { useCategoryStore } from "../stores/category.js";
import { inject } from "vue";
import Instruction from "./Instruction.vue";

import InlineListItem from "./InlineListItem.vue";
export default {
  components: {
    HotelRating,
    HotelAvatarInline,
    Instruction,
    InlineListItem,
  },
  setup() {
    const hotelStore = useHotelStore();
    const categoryStore = useCategoryStore();
    const hotelMeta = inject("hotelMeta");
    const city = inject("city");
    return { hotelStore, categoryStore, hotelMeta, city };
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
      if (variety < 0.2) {
        return "almost identically";
      } else if (variety < 0.4) {
        return "quite comparably";
      } else if (variety < 0.6) {
        return "somewhat differently";
      } else if (variety < 0.8) {
        return "quite variably";
      }
      return "with clear differences";
    },
    topRatedHotels() {
      if (this.hotelStore.selectedHotelIds.length === 0) {
        return [];
      }
      // sort hotels by rating
      const ratings = this.hotelStore.selectedHotelIds.map((hotelId) => {
        return {
          hotelId: hotelId,
          rating: this.hotelStore.overallRating(hotelId),
        };
      });
      ratings.sort((a, b) => b.rating - a.rating);
      // cut off if difference to best hotel is larger than 0.2
      const bestRating = ratings[0].rating;
      const topRatedHotels = ratings.filter(
        (ratedHotel) => bestRating - ratedHotel.rating < 0.2
      );
      return topRatedHotels.map((ratedHotel) => ratedHotel.hotelId);
    },
  },
};
</script>

<template>
  <div v-if="hotelStore.selectedHotelIds.length > 1">
    <p>
      <span>
        Customers have rated the selected hotels <b>{{ ratingVarietyDescription }}</b>.
      </span>
      <span v-if="topRatedHotels.length > 0">
        <InlineListItem v-for="(hotelId, index) in topRatedHotels" :key="hotelId" :index="index"
          :listLength="topRatedHotels.length">
          <strong>
            <HotelAvatarInline :hotelId="hotelId"></HotelAvatarInline>
            {{ hotelMeta[hotelId].name }}
          </strong>
        </InlineListItem>
        <span v-if="topRatedHotels.length > 1"> are </span>
        <span v-else> is </span> the overall best fitting hotel<span v-if="topRatedHotels.length > 1">s</span>.
      </span>
    </p>
    <div class="d-flex flex-column hotel-list my-4">
      <HotelRating v-for="hotelId in hotelStore.selectedHotelIdsSortedByRating" :key="hotelId" :hotelId="hotelId"></HotelRating>
      <v-label class="ml-4">Rating weighted by priorities <v-icon icon="mdi-arrow-right"></v-icon></v-label>
    </div>
  </div>
</template>

<style>
.hotel-list {
  border-left: 1px solid black;
}
</style>