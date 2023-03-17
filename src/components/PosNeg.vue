<script>
import CategoryPosNeg from "./CategoryPosNeg.vue";
import ChartPosNeg from "./ChartPosNeg.vue";
import { useHotelStore } from "../stores/hotel.js";
import { useCategoryStore } from "../stores/category.js";

export default {
  components: {
    CategoryPosNeg,
    ChartPosNeg,
  },
  setup() {
    const hotelStore = useHotelStore();
    const categoryStore = useCategoryStore();
    return { hotelStore, categoryStore };
  },
  computed: {}
};
</script>

<template>
  <div class="ml-12">
    <div
        class="ma-2 flex-grow-1 w-90">
      <v-card
          :title="'Overall Sentiments'">
        <v-table class="ma-2 flex-grow-1 w-90">
          <tr>
            <th width="100px"
                class="pa-2">Hotel</th>
            <th width="35%"
                class="pa-2">Negative</th>
            <th width="100px"
                class="pa-2"></th>
            <th width="35%"
                class="pa-2">Positive</th>
          </tr>
          <tr
              v-for="hotel in hotelStore.selectedHotels">
            <td width="100px"
                class="pa-2">{{ hotel.name }}</td>
            <td width="35%"
                class="pa-2">
              {{ hotel.neg_summary }}
            </td>
            <td v-if="hotel == hotelStore.selectedHotels[0]" rowspan="100%" width="100px">
              <ChartPosNeg
                  :categoryPosNeg="hotelStore.overallPosNeg"
                  :color="'#999999'"
                  :width="100"
                  :height="300"
                  :x-min = "-6"
                  :x-max = "6"
                  class="d-flex justify-center"
              ></ChartPosNeg>
            </td>
            <td width="35%"
                class="pa-2">
              {{ hotel.pos_summary }}
            </td>
          </tr>
        </v-table>
      </v-card>
    </div>

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