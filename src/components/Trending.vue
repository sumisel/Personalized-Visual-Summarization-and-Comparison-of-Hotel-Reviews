<script>
import ChartTrending from "./ChartTrending.vue";
import { useHotelStore } from "../stores/hotel.js";
import { useCategoryStore } from "../stores/category.js";
import { useTimeStore } from "../stores/ratings_over_time";

export default {
  components: {
    ChartTrending,
  },
  setup() {
    const hotelStore = useHotelStore();
    const categoryStore = useCategoryStore();
    const timeStore = useTimeStore();
    return { hotelStore, categoryStore, timeStore };
  },
  computed: {},
  data: () => ({
    panel: [0, 1],
  })
};

</script>

<template>
  <div class="ml-12">
    <div class="d-flex flex-column my-4">
      <div
          class="ma-2 flex-grow-1 w-90">
        <v-expansion-panels
            v-for="hotel in hotelStore.selectedHotels" :key="'time_'+hotel.id">
          <v-expansion-panel>
            <v-expansion-panel-title :key="'title_'+hotel.id">
              <v-row>
                <div class="pa-2 hotel-name-title"><b>{{ hotel.name }}</b></div>
                <div class="pa-2 time-chart">
                  <ChartTrending
                      :hotelId = "hotel.id"
                      :categoryId="'line'"
                      :data="timeStore.dataById[hotel.id]"
                      :color="'#999999'"
                      :width="200"
                      :height="50"
                      :yMin = "1"
                      :yMax = "5"
                  ></ChartTrending>
                </div>
              </v-row>
            </v-expansion-panel-title>
            <v-expansion-panel-text>
              <v-row class="d-flex"
                  v-for="category in categoryStore.relevantCategories.sort((a, b) => b.value - a.value)" :key="'time_'+hotel.id+'_'+category.id">
                <div class="pa-2 hotel-name">
                  <CategoryName :categoryId="category.id"></CategoryName>
                </div>
                <div class="pa-2 time-chart">
                  <ChartTrending
                      :hotel="hotel.id"
                      :category="category.id"
                      :data="timeStore.dataById[hotel.id][category.id]"
                      :color="category.color"
                      :width="1000"
                      :height="50"
                      :yMin = "1"
                      :yMax = "5"
                  ></ChartTrending>
                </div>
              </v-row>
            </v-expansion-panel-text>
          </v-expansion-panel>
        </v-expansion-panels>
      </div>




    </div>
  </div>
</template>

<style>
.hotel-name-title {
  width: 50% !important;
  vertical-align: middle;
}

.time-chart {
  height: 100px !important;
  width: 50% !important;
  text-align: center;
  vertical-align: middle;
}

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
</style>