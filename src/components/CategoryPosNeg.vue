<script setup xmlns="http://www.w3.org/1999/html">

import CategoryName from "./CategoryName.vue";

import { useHotelStore } from "../stores/hotel.js";
import { useCategoryStore } from "../stores/category.js";
import ChartPosNeg from "@/components/ChartPosNeg.vue";
import PosNegBulletPoint from "@/components/PosNegBulletPoint.vue";

const hotelStore = useHotelStore();
const categoryStore = useCategoryStore();

const props = defineProps({
  category: Object,
  data: () => ({
    subPanel: [0, 1],
  })
});

</script>

<template>
  <div class="d-block flex-no-wrap justify-space-between">
    <!--<div
      class="ma-2 flex-grow-1 w-100">
      <v-icon
          :icon="category.icon"
          class="mr-2"
          :color="category.color"
      ></v-icon>
      {{ category.title }}
    </div>
    -->
    <div
        class="ma-2 flex-grow-1 w-90">
      <v-expansion-panels>
        <v-expansion-panel>
          <v-expansion-panel-title :key="'title_'+category['id']"
            :style="[(category['hover'] || categoryStore.noCategoryHovered)?{'opacity': 1}:{'opacity': .2}]">
            <v-row>
              <div class="pa-2 hotel-name">
                <CategoryName :categoryId="category['id']"></CategoryName>
              </div>
              <div class="pa-2 sentiment-text"></div>
              <div class="pa-2 sentiment-chart">
                <ChartPosNeg
                    :categoryId="category['id']"
                    :hotelId = "'selected'"
                    :posNeg= "hotelStore.countsCategoryPosNeg(category['id'], hotelStore.selectedHotels)"
                    :color="category['color']"
                    :width="100"
                    :height="20"
                    :xMin = "-1"
                    :xMax = "1"
                    :key="'posneg_chart_'+category['id']"
                ></ChartPosNeg>
              </div>
              <div class="pa-2 sentiment-text"></div>
            </v-row>
          </v-expansion-panel-title>
          <v-expansion-panel-text
              :style="[(category['hover'] || categoryStore.noCategoryHovered)?{'opacity': 1}:{'opacity': .2}]">
          <v-table class="ma-2 flex-grow-1 w-90" table-layout="fixed">
            <tr v-for="hotel in hotelStore.selectedHotels" :key="category['id']+'_'+hotel['id']">
              <td class="pa-2 hotel-name">{{ hotel.name }}</td>
              <td class="pa-2 sentiment-text">
                <PosNegBulletPoint
                    :hotel = "hotel"
                    :categoryId = "category['id']"
                    :polarity = "'neg'" ></PosNegBulletPoint>
              </td>
              <td class="sentiment-chart">
                <ChartPosNeg
                    :categoryId="category['id']"
                    :hotelId = "hotel['id']"
                    :posNeg= "hotelStore.countsCategoryPosNeg(category['id'], [hotel])"
                    :color="category['color']"
                    :width="100"
                    :height="50"
                    :xMin = "-1"
                    :xMax = "1"
                    :key="'posneg_chart_'+hotel['id']+'_'+category['id']"
                ></ChartPosNeg>
              </td>
              <td class="pa-2 sentiment-text">
                <PosNegBulletPoint
                    :hotel = "hotel"
                    :categoryId = "category['id']"
                    :polarity = "'pos'" ></PosNegBulletPoint>
              </td>
            </tr>
          </v-table>
          </v-expansion-panel-text>
        </v-expansion-panel>
      </v-expansion-panels>
    </div>
  </div>
</template>

<style scoped>
.hotel-name {
  width: 15% !important;
}

.sentiment-text {
  width: 35% !important;
}

.sentiment-chart {
  width: 15% !important;
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
