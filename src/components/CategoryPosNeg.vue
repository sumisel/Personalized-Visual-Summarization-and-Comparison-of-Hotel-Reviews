<script setup xmlns="http://www.w3.org/1999/html">
import { computed } from "vue";

import Glyph from "./Glyph.vue";
import CategoryName from "./CategoryName.vue";

import { useHotelStore } from "../stores/hotel.js";
import { useCategoryStore } from "../stores/category.js";
import ChartPosNeg from "@/components/ChartPosNeg.vue";

const hotelStore = useHotelStore();
const categoryStore = useCategoryStore();

const props = defineProps({
  category: Object,
});

const categoryPosNeg = computed(() => hotelStore.categoryPosNeg(props.category.id));
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
          <v-expansion-panel-title :key="'title_'+category.id">
            <v-row>
              <div class="pa-2 hotel-name">
                <CategoryName :categoryId="category.id"></CategoryName>
              </div>
              <div class="pa-2 sentiment-text"></div>
              <div class="pa-2 sentiment-chart">
                <ChartPosNeg
                    :categoryId="category.id"
                    :hotelId = "'selected'"
                    :posNeg=hotelStore.categoryPosNeg(category.id)
                    :color="category.color"
                    :width="100"
                    :height="20"
                    :x-min = "-30"
                    :x-max = "30"
                ></ChartPosNeg>
              </div>
              <div class="pa-2 sentiment-text"></div>
            </v-row>
          </v-expansion-panel-title>
          <v-expansion-panel-text>
          <v-table class="ma-2 flex-grow-1 w-90" table-layout="fixed">
            <tr>
              <th class="pa-2 hotel-name">Hotel</th>
              <th class="pa-2 sentiment-text">Negative</th>
              <th class="sentiment-chart"></th>
              <th class="pa-2 sentiment-text">Positive</th>
            </tr>
            <tr v-for="hotel in hotelStore.selectedHotels" :key="category.id+'_'+hotel.id">
              <td class="pa-2 hotel-name">{{ hotel.name }}</td>
              <td class="pa-2 sentiment-text">
                <p
                    v-for="sentence in hotel.neg_summary_category[category.id]" :key="category.id+'_'+hotel.id+'_'+sentence.idx">
                  {{ sentence.text }}.
                </p>
              </td>
              <td class="sentiment-chart">
                <ChartPosNeg
                    :categoryId="category.id"
                    :hotelId = "hotel.id"
                    :posNeg="[{'posCount': hotel['pos_counts_category'][category.id],
                                'negCount': hotel['neg_counts_category'][category.id]
                                }]"
                    :color="category.color"
                    :width="100"
                    :height="50"
                    :x-min = "-30"
                    :x-max = "30"
                ></ChartPosNeg>
              </td>
              <td class="pa-2 sentiment-text">
                <p
                    v-for="sentence in hotel.pos_summary_category[category.id]" :key="category.id+'_'+hotel.id+'_'+sentence.idx">
                  {{ sentence.text }}.
                </p>
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
