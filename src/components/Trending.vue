<script>
import { inject } from "vue";
import ChartTrendingBoxPlot from "./ChartTrendingBoxPlot.vue";
import ChartTrendingHistogram from "./ChartTrendingHistogram.vue";
import ChartTrendingLine from "./ChartTrendingLine.vue";
import { useHotelStore } from "../stores/hotel.js";
import { useCategoryStore } from "../stores/category.js";
import { useTimeStore } from "../stores/ratings_over_time";
import CategoryName from "@/components/CategoryName.vue";

import HotelName from "./HotelName.vue";
export default {
  components: {
    CategoryName,
    ChartTrendingLine,
    ChartTrendingBoxPlot,
    ChartTrendingHistogram,
    HotelName
  },
  setup() {
    const hotelStore = useHotelStore();
    const categoryStore = useCategoryStore();
    const timeStore = useTimeStore();
    const hotelMeta = inject("hotelMeta");
    const city = inject("city");
    const breakpointStrong = 0.6;
    const breakpointWeak   = 0.2;
    return { hotelStore, categoryStore, timeStore, hotelMeta, city, breakpointStrong, breakpointWeak };
  },
  computed: {},
  methods: {
    trendDescription(hotelId, categoryId) {
      const d = this.timeStore.compileCategoryData(hotelId, categoryId);
      const trend = this.timeStore.regression(d["data"], d["x_min"], d["x_max"]);

      const slope = trend["a"];
      const intercept = trend[0][1];
      const endValue = trend[1][1];
      const difference = endValue - intercept;
      let slopeDescription = "";
      let valueDescription = "";
      let interceptDescription = "";
      let endValueDescription = "";

      if (difference > this.breakpointStrong) {
        slopeDescription =  "a strong upward trend";
      } else if (difference > this.breakpointWeak) {
        slopeDescription =  "a slight upward trend";
      } else if (difference < -this.breakpointStrong) {
        slopeDescription =  "a strong downward trend";
      } else if (difference < -this.breakpointWeak) {
        slopeDescription =  "a slight downward trend";
      } else {
        slopeDescription =  "no clear trend";
      }

      if (intercept > 4.5) {
        interceptDescription = "very high";
      } else if (intercept > 3.5) {
        interceptDescription = "high";
      } else if (intercept > 2.5) {
        interceptDescription = "medium";
      } else if (intercept > 1.5) {
        interceptDescription = "low";
      } else {
        interceptDescription = "very low";
      }

      if (endValue > 4.5) {
        endValueDescription += "very high";
      } else if (endValue > 3.5) {
        endValueDescription += "high";
      } else if (endValue > 2.5) {
        endValueDescription += "medium";
      } else if (endValue > 1.5) {
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
    trendIcon(hotelId, categoryId) {
      const d = this.timeStore.compileCategoryData(hotelId, categoryId);
      const trend = this.timeStore.regression(d["data"], d["x_min"], d["x_max"]);

      let icon = "";
      const slope = trend["a"];
      const difference = trend[1][1] - trend[0][1];
      if (difference > this.breakpointStrong) {
        icon = "mdi-arrow-up-circle-outline";
      } else if (difference > this.breakpointWeak) {
        icon = "mdi-arrow-top-right-thin-circle-outline";
      } else if (difference < -this.breakpointStrong) {
        icon = "mdi-arrow-down-circle-outline";
      } else if (difference < -this.breakpointWeak) {
        icon = "mdi-arrow-bottom-right-thin-circle-outline";
      } else {
        icon = "mdi-arrow-right-circle-outline";
      }

      return icon;
    }
  },
  data: () => ({
    panel: [0, 1],
    show: {},
  }),
};
</script>

<template>
  <div v-if="hotelStore.selectedHotelIds.length > 1">
    <div class="d-flex flex-column my-4">
      <div class="my-2 flex-grow-1">
        <v-card
            v-for="hotelId in hotelStore.selectedHotelIdsSortedByRating"
            :key="'time_' + hotelId"
              class="pa-3 my-2"
        >
          <v-row>
            <div class="pa-2 trend-description-title">
              <HotelName :hotelId="hotelId" avatar></HotelName>
              <div class="pa-2">
                The overall rating of this hotel shows <b>{{ trendDescription(hotelId, 'average')}}</b>.
              </div>
            </div>
            <div class="pa-2 trend-icon-title">
              <v-icon>{{ trendIcon(hotelId, 'average') }}</v-icon>
            </div>
            <div class="pa-2 time-chart">
              <ChartTrendingLine
                  :hotelId="hotelId"
                  :categoryId="'average'"
                  :color="'#999999'"
                  :width="300"
                  :height="50"
                  :yMin="2"
                  :yMax="5"
              ></ChartTrendingLine>
            </div>
            <v-card-actions>
              <v-btn
                :icon="show[hotelId] ? 'mdi-chevron-up' : 'mdi-chevron-down'"
                @click="show[hotelId] = !show[hotelId]"
              ></v-btn>
            </v-card-actions>
          </v-row>
          <v-expand-transition>
            <div v-show="show[hotelId]">
              <v-divider></v-divider>
              <v-row
                  v-for="category in categoryStore.relevantCategories.sort(
                  (a, b) => b.value - a.value
                )"
                  @mouseenter="categoryStore.hover(category.id);"
                  @mouseleave="categoryStore.unhover();"
                  :key="'time_' + hotelId + '_' + category.id"
                  :style="[{'opacity': (categoryStore.noCategoryHovered || categoryStore.categoriesById[category.id].hover)?1:.2},]">
                <div class="pa-2 trend-description-detail">
                  <div>
                    <CategoryName :categoryId="category['id']"></CategoryName>: {{ trendDescription(hotelId, category.id)}}.
                  </div>
                </div>
                <div class="pa-2 trend-icon-title">
                  <v-icon
                      :style="[{ color: category.color }]"
                  >{{ trendIcon(hotelId, category.id) }}</v-icon>
                </div>
                <div class="pa-2 time-chart">
                  <ChartTrendingLine
                      :hotelId="hotelId"
                      :categoryId="category.id"
                      :color="category.color"
                      :width="300"
                      :height="50"
                      :yMin="2"
                      :yMax="5"
                  ></ChartTrendingLine>
                </div>
              </v-row>
            </div>
          </v-expand-transition>
        </v-card>
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
  width: 55% !important;
  vertical-align: middle;
  justify-content: end;
}
.trend-icon-title {
  width: 5% !important;
  display: flex;
  align-items: center;
  vertical-align: middle;
  horizontal-align: left;
}

.trend-description-detail {
  width: 53.5% !important;
  display: flex;
  align-items: center;
  vertical-align: middle;
  justify-content: end;
}

.time-chart {
  height: 100px !important;
  width: 33% !important;
  display: flex;
  align-items: center;
  text-align: center;
  vertical-align: middle;
}

.box-plot {
  height: 100px !important;
  width: 53.5% !important;
  display: flex;
  align-items: center;
  text-align: center;
  vertical-align: middle;
  justify-content: end;
}

</style>