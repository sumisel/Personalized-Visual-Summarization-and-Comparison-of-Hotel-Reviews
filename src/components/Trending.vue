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
  methods: {
    trendDescription(hotelId, categoryId) {
      const d = this.timeStore.compileCategoryData(hotelId, categoryId);
      const trend = this.timeStore.regression(d["data"], d["x_min"], d["x_max"]);
      console.log(trend);

      const slope = trend["a"];
      const intercept = trend[0][1];
      const breakpointStrong = 0.00000000001;
      const breakpointWeak = 0.0000000000005;
      let slopeDescription = "";
      if (slope > breakpointStrong) {
        slopeDescription =  "a strong upward trend";
      } else if (slope > breakpointWeak) {
        slopeDescription =  "a slight upward trend";
      } else if (slope < -breakpointStrong) {
        slopeDescription =  "a strong downward trend";
      } else if (slope < -breakpointWeak) {
        slopeDescription =  "a slight downward trend";
      } else {
        slopeDescription =  "no clear trend";
      }

      let interceptDescription = "";
      if (intercept > 4) {
        interceptDescription = "very high";
      } else if (intercept > 3) {
        interceptDescription = "high";
      } else if (intercept > 2) {
        interceptDescription = "medium";
      } else if (intercept > 1) {
        interceptDescription = "low";
      } else {
        interceptDescription = "very low";
      }

      let valueDescription = "";
      const endValue = trend[1][1];
      let endValueDescription = "";

      if (endValue > 4) {
        endValueDescription += "very high";
      } else if (endValue > 3) {
        endValueDescription += "high";
      } else if (endValue > 2) {
        endValueDescription += "medium";
      } else if (endValue > 1) {
        endValueDescription += "low";
      } else {
        endValueDescription += "very low";
      }

      if(interceptDescription === endValueDescription) {
        valueDescription = "at " + interceptDescription;
      } else {
        valueDescription = "from " + interceptDescription + " to " + endValueDescription
      }
      return slopeDescription + ", " + valueDescription + " ratings";
    },
  },
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
                  <div class="pa-2 trend-description-title">
                    The overall rating of this hotel shows <i>{{ trendDescription(hotelId, 'average')}}</i>.
                  </div>
                </div>
                <div class="pa-2 time-chart">
                  <ChartLine
                    :hotelId="hotelId"
                    :categoryId="'average'"
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
                <div class="pa-2 trend-description-detail">
                  The {{category.id}} rating of this hotel shows <i>{{ trendDescription(hotelId, category.id)}}</i>.
                </div>
                <div class="pa-2 time-chart">
                  <ChartLine
                      :hotelId="hotelId"
                      :categoryId="category.id"
                      :color="category.color"
                      :width="300"
                      :height="50"
                      :yMin="1"
                      :yMax="5"
                  ></ChartLine>
                </div>
                <div class="pa-2 box-plot">
                  <ChartBoxPlot
                    :hotelId="hotelId"
                    :categoryId="category.id"
                    :color="category.color"
                    :width="300"
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

.trend-description-title {
  width: 100% !important;
  vertical-align: middle;
  horizontal-align: center;
}

.trend-description-detail {
  width: 33% !important;
  vertical-align: middle;
  horizontal-align: center;
}

.time-chart {
  height: 100px !important;
  width: 33% !important;
  text-align: center;
  vertical-align: middle;
}

.box-plot {
  height: 100px !important;
  width: 33% !important;
  text-align: center;
  vertical-align: middle;
}

</style>