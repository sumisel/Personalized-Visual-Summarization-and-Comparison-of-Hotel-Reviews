<script>
import Glyph from "./Glyph.vue";
import CategoryName from "./CategoryName.vue";
import { useHotelStore } from "../stores/hotel.js";
import { useCategoryStore } from "../stores/category.js";

export default {
  props: {
    hotel: Object,
  },
  components: {
    Glyph,
    CategoryName,
  },
  setup() {
    const hotelStore = useHotelStore();
    const categoryStore = useCategoryStore();
    return { hotelStore, categoryStore };
  },
  computed: {
    bestCategories() {
      const categories = this.categoryStore.relevantCategories;
      const ratingsDiff = {
        location: 5.0,
        value: 5.0,
        rooms: 5.0,
        service: 5.0,
        cleanliness: 5.0,
        sleep: 5.0,
      };
      this.hotelStore.hotels.forEach((hotel2) => {
        if (this.hotel.id != hotel2.id) {
            categories.forEach((category) => {
            ratingsDiff[category.id] = Math.min(
              ratingsDiff[category.id],
              this.hotel.ratings[category.id] - hotel2.ratings[category.id]
            );
          })
        }
      });
      const clearlyBestCategories = [];
      categories.forEach((category) => {
        if (ratingsDiff[category.id] > 0.29) {
          clearlyBestCategories.push(category.id);
        }
      });
      return clearlyBestCategories;
    },
  },
};
</script>

<template>
  <v-card
    class="ma-2 flex-grow-1 w-50"
    :style="`margin-left: ${
      hotelStore.overallRating(hotel) * 100
    }px !important;`"
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
        <v-card-text v-if="bestCategories.length" class="d-flex flex-row">
          <div class="flex-grow-0 mr-4">
            <v-icon icon="mdi-thumb-up"></v-icon>
          </div>
          <div class="flex-grow-1">
            Clearly best
            <span
              v-for="(categoryId, index) in bestCategories"
              :key="categoryId"
            >
              <span v-if="bestCategories.length > 1">
                <span v-if="bestCategories.length === index + 1"> and </span
                ><span v-if="index > 0 && index + 1 < bestCategories.length"
                  >,
                </span></span
              ><CategoryName :categoryId="categoryId"></CategoryName>
            </span>
          </div>
        </v-card-text>
      </div>
    </div>
  </v-card>
</template>

<style scoped>
.v-avatar {
  width: 100px !important;
  height: 100px !important;
}
</style>
