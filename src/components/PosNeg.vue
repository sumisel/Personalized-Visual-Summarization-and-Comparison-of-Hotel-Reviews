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
            <th style="width:100px;"
                class="pa-2 hotel-name">Hotel</th>
            <th class="pa-2 sentiment-text">Negative</th>
            <th class="sentiment-chart"></th>
            <th class="pa-2 sentiment-text">Positive</th>
          </tr>
          <tr
              v-for="hotel in hotelStore.selectedHotels">
            <td class="pa-2 hotel-name">{{ hotel.name }}</td>
            <td class="pa-2 sentiment-text">
              {{ hotel.neg_summary }}
            </td>
            <td class="sentiment-chart">
              <ChartPosNeg
                  :posNeg="[{'posCount': hotel['pos_counts_overall'],
                              'negCount': hotel['neg_counts_overall']
                              }]"
                  :color="'#999999'"
                  :width="100"
                  :height="300"
                  :x-min = "-6"
                  :x-max = "6"
              ></ChartPosNeg>
            </td>
            <td class="pa-2 sentiment-text">
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
.hotel-name {
  width: 15% !important;
}

.sentiment-text {
  width: 35% !important;
}

.sentiment-chart {
  width: 15% !important;
  text-align: center;
}
</style>