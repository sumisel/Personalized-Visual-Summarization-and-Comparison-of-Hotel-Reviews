<script>
import { inject } from "vue";
import ChartBoxPlot from "./ChartBoxPlot.vue";
import ChartLine from "./ChartLine.vue";
import { useHotelStore } from "../stores/hotel.js";
import { useCategoryStore } from "../stores/category.js";
import { useTimeStore } from "../stores/ratings_over_time";

export default {
  components: {
    ChartLine,
    ChartBoxPlot,
  },
  setup() {
    const hotelStore = useHotelStore();
    const categoryStore = useCategoryStore();
    const timeStore = useTimeStore();
    const hotelMeta = inject("hotelMeta");
    return { hotelStore, categoryStore, timeStore, hotelMeta };
  },
  computed: {},
  data: () => ({
    panel: [0, 1],
  }),
};
</script>

<template>
  <div v-if="hotelStore.selectedHotelIds.length > 1">
    <div class="d-flex flex-column my-4">
      <div class="my-2 flex-grow-1">
        <v-expansion-panels
          v-for="hotelId in hotelStore.selectedHotelIds"
          :key="'time_' + hotelId"
        >
          <v-expansion-panel>
            <v-expansion-panel-title :key="'title_' + hotelId">
              <v-row>
                <div class="pa-2 hotel-name-title">
                  <b>{{ hotelMeta[hotelId].name }}</b>
                </div>
                <div class="pa-2 time-chart">
                  <ChartLine
                    :hotelId="hotelId"
                    :categoryId="'line'"
                    :color="'#999999'"
                    :width="200"
                    :height="50"
                    :yMin="1"
                    :yMax="5"
                  ></ChartLine>
                </div>
              </v-row>
            </v-expansion-panel-title>
            <v-expansion-panel-text>
              <v-row
                class="d-flex"
                v-for="category in categoryStore.relevantCategories.sort(
                  (a, b) => b.value - a.value
                )"
                :key="'time_' + hotelId + '_' + category.id"
              >
                <div class="pa-2 box-plot">
                  <ChartBoxPlot
                    :hotelId="hotelId"
                    :categoryId="category.id"
                    :color="category.color"
                    :width="450"
                    :height="50"
                    :yMin="1"
                    :yMax="5"
                  ></ChartBoxPlot>
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

.box-plot {
  height: 100px !important;
  width: 100% !important;
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