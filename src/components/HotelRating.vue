<script setup>
import { computed } from "vue";

import Glyph from "./Glyph.vue";
import CategoryName from "./CategoryName.vue";

import { useHotelStore } from "../stores/hotel.js";
import { useCategoryStore } from "../stores/category.js";

const hotelStore = useHotelStore();
const categoryStore = useCategoryStore();

const props = defineProps({
  hotel: Object,
});

const offset = computed(
  () => `${hotelStore.overallRating(props.hotel) * 80}px`
);
const bestCategories = computed(() => hotelStore.bestCategories(props.hotel));
const topCategories = computed(() => hotelStore.topCategories(props.hotel));
</script>

<template>
  <v-card
    class="ma-2 flex-grow-1 w-50"
    :style="`margin-left: ${offset} !important;`"
    ><div class="d-flex flex-no-wrap justify-space-between">
      <div
        class="bar"
        :style="`width: ${offset} !important; left: -${offset} !important;`"
      ></div>
      <v-avatar class="ma-3 flex-grow-0" size="125" rounded="0">
        <Glyph
          :ratings="hotel.ratings"
          :minRatings="hotelStore.minRatings"
          :hotelId="hotel.id"
          :hotelName="hotel.name"
        ></Glyph>
      </v-avatar>
      <div class="flex-grow-1">
        <v-card-title class="text-h5">{{ hotel.name }}</v-card-title>
        <v-card-text>
          <div class="d-flex flex-row" v-if="bestCategories.length">
            <div class="flex-grow-0 mr-4">
              <v-icon icon="mdi-star"></v-icon>
            </div>
            <div class="flex-grow-1 my-1">
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
          </div>
          <div class="d-flex flex-row" v-if="topCategories.length">
            <div class="flex-grow-0 mr-4">
              <v-icon icon="mdi-star-outline"></v-icon>
            </div>
            <div class="flex-grow-1 my-1">
              Among top in
              <span
                v-for="(categoryId, index) in topCategories"
                :key="categoryId"
              >
                <span v-if="topCategories.length > 1">
                  <span v-if="topCategories.length === index + 1"> and </span
                  ><span v-if="index > 0 && index + 1 < topCategories.length"
                    >,
                  </span></span
                ><CategoryName :categoryId="categoryId"></CategoryName>
              </span>
            </div>
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

.v-card {
  overflow: visible;
}

.v-card-title {
  white-space: normal;
}

.bar {
  background: linear-gradient(
    90deg,
    rgba(207, 207, 207, 1) 0%,
    rgba(133, 133, 133, 1) 100%
  );
  position: absolute;
  height: 50px;
  top: 35px;
  content: "test";
}
</style>
