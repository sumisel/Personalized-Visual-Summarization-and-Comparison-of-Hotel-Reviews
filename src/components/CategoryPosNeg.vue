<script setup xmlns="http://www.w3.org/1999/html">
import CategoryName from "./CategoryName.vue";

import { useHotelStore } from "../stores/hotel.js";
import { useCategoryStore } from "../stores/category.js";
import ChartPosNeg from "@/components/ChartPosNeg.vue";
import PosNegBulletPoint from "@/components/PosNegBulletPoint.vue";
import { inject } from "vue";

const hotelStore = useHotelStore();
const categoryStore = useCategoryStore();
const hotelMeta = inject("hotelMeta");

const props = defineProps({
  category: Object,
  data: () => ({
    subPanel: [0, 1],
  }),
});
</script>

<template>
  <div class="d-block flex-no-wrap justify-space-between">
    <div class="my-2 flex-grow-1">
      <v-expansion-panels>
        <v-expansion-panel>
          <v-expansion-panel-title
            :key="'title_' + category['id']"
            :style="[
              category['hover'] || categoryStore.noCategoryHovered
                ? { opacity: 1 }
                : { opacity: 0.2 },
            ]"
          >
            <v-row>
              <div class="pa-2 hotel-name">
                <CategoryName :categoryId="category['id']"></CategoryName>
              </div>
              <div class="pa-2 sentiment-text-title"></div>
              <div class="pa-2">
                <ChartPosNeg
                  :categoryId="category['id']"
                  :hotelId="'selected'"
                  :posNeg="
                    hotelStore.countsCategoryPosNeg(
                      category['id'],
                      hotelStore.selectedHotelIds.map((id) => hotelMeta[id])
                    )
                  "
                  :color="category['color']"
                  :width="200"
                  :height="20"
                  :xMin="-1"
                  :xMax="1"
                  :key="'posneg_chart_' + category['id']"
                ></ChartPosNeg>
              </div>
              <div class="pa-2 sentiment-text-title"></div>
            </v-row>
          </v-expansion-panel-title>
          <v-expansion-panel-text
            :style="[
              category['hover'] || categoryStore.noCategoryHovered
                ? { opacity: 1 }
                : { opacity: 0.2 },
            ]"
          >
            <v-table class="my-2 flex-grow-1" table-layout="fixed">
              <template
                v-for="hotel in hotelStore.selectedHotelIds.map(
                  (id) => hotelMeta[id]
                )"
                :key="category['id'] + '_' + hotel['id']"
              >
                <tr>
                  <td class="pa-2 hotel-name"></td>
                  <td colspan="3" class="sentiment-chart">
                    <ChartPosNeg
                      :categoryId="category['id']"
                      :hotelId="hotel['id']"
                      :posNeg="
                        hotelStore.countsCategoryPosNeg(category['id'], [hotel])
                      "
                      :color="category['color']"
                      :width="200"
                      :height="10"
                      :xMin="-1"
                      :xMax="1"
                      :key="
                        'posneg_chart_' + hotel['id'] + '_' + category['id']
                      "
                    ></ChartPosNeg>
                  </td>
                </tr>
                <tr>
                  <td class="pa-2 hotel-name">{{ hotel.name }}</td>
                  <td class="pa-2 sentiment-text">
                    <PosNegBulletPoint
                      :hotel="hotel"
                      :categoryId="category['id']"
                      :polarity="'neg'"
                    ></PosNegBulletPoint>
                  </td>
                  <td class="placeholder"></td>
                  <td class="pa-2 sentiment-text">
                    <PosNegBulletPoint
                      :hotel="hotel"
                      :categoryId="category['id']"
                      :polarity="'pos'"
                    ></PosNegBulletPoint>
                  </td>
                </tr>
              </template>
            </v-table>
          </v-expansion-panel-text>
        </v-expansion-panel>
      </v-expansion-panels>
    </div>
  </div>
</template>

