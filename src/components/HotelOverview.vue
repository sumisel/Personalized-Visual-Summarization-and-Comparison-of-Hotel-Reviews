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
          <v-card-text
            v-if="hotelStore.isClearlyBest(hotel).length"
            class="d-flex flex-row"
          >
            <div class="flex-grow-0 mr-4">
              <v-icon icon="mdi-thumb-up"></v-icon>
            </div>
            <div class="flex-grow-1">
              Clearly the best
              <span
                v-for="(categoryId, index) in hotelStore.isClearlyBest(hotel)"
                :key="categoryId"
              >
                <span v-if="hotelStore.isClearlyBest(hotel).length > 1">
                  <span
                    v-if="hotelStore.isClearlyBest(hotel).length === index + 1"
                  >
                    and </span
                  ><span
                    v-if="
                      index > 0 &&
                      index + 1 < hotelStore.isClearlyBest(hotel).length
                    "
                    >,
                  </span></span
                ><CategoryName :categoryId="categoryId"></CategoryName>
              </span>
            </div>
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
