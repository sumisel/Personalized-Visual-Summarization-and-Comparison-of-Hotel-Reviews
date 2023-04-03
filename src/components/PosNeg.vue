<script>
import CategoryPosNeg from "./CategoryPosNeg.vue";
import ChartPosNeg from "./ChartPosNeg.vue";
import { useHotelStore } from "../stores/hotel.js";
import { useCategoryStore } from "../stores/category.js";
import {useClusterStore} from "../stores/cluster.js";

export default {
  components: {
    CategoryPosNeg,
    ChartPosNeg,
  },
  setup() {
    const hotelStore = useHotelStore();
    const categoryStore = useCategoryStore();
    const clusterStore = useClusterStore();
    return { hotelStore, categoryStore, clusterStore };
  },
  computed: {},
  data: () => ({
    panel: [0, 1],
  })
};

</script>

<template>
  <div class="ml-12">
    <div
        class="ma-2 flex-grow-1 w-90">
      <v-expansion-panels
          v-model="panel">
        <v-expansion-panel>
          <v-expansion-panel-title :key="'title_overall'">
            <v-row>
              <div class="pa-2 hotel-name">
                <b><u>Sentiment Overview</u></b>
              </div>
              <div class="pa-2 sentiment-text"></div>
              <div class="pa-2 sentiment-chart">
                <ChartPosNeg
                    :categoryId="'overall'"
                    :hotelId = "'selected'"
                    :posNeg=hotelStore.overallPosNeg
                    :color="'#999999'"
                    :width="100"
                    :height="20"
                    :xMin = "-30"
                    :xMax = "30"
                ></ChartPosNeg>
              </div>
              <div class="pa-2 sentiment-text"></div>
            </v-row>
          </v-expansion-panel-title>
          <v-expansion-panel-text>
            <v-table class="ma-2 flex-grow-1 w-90">
              <tr
                  v-for="hotel in hotelStore.selectedHotels" :key="'overall_'+hotel.id">
                <td class="pa-2 hotel-name">{{ hotel.name }}</td>
                <td class="pa-2 sentiment-text">
                  <p
                      v-for="sentence in hotel.neg_summary"
                      :key="'overall_neg_'+hotel.id+'_'+sentence.idx"
                      @mouseenter="clusterStore.hover(sentence.cluster)"
                      @mouseleave="clusterStore.unhover()"
                      :style="[(clusterStore.clustersById[sentence.cluster].hover || clusterStore.noClusterHovered('overall'))?{'opacity': 1}:{'opacity': .2}]">
                    <v-icon icon="mdi-minus-circle-outline" /> {{ sentence.text }}.
                  </p>
                </td>
                <td class="sentiment-chart">
                  <ChartPosNeg
                      :categoryId="'overall'"
                      :hotelId = "hotel.id"
                      :posNeg="[{'posCount': hotel['pos_counts_overall'],
                                  'negCount': hotel['neg_counts_overall']
                                  }]"
                      :color="'#999999'"
                      :width="100"
                      :height="50"
                      :xMin = "-6"
                      :xMax = "6"
                  ></ChartPosNeg>
                </td>
                <td class="pa-2 sentiment-text">
                  <p
                      v-for="sentence in hotel.pos_summary"
                      :key="'overall_pos_'+hotel.id+'_'+sentence.idx"
                      @mouseenter="clusterStore.hover(sentence.cluster)"
                      @mouseleave="clusterStore.unhover()"
                      :style="[(clusterStore.clustersById[sentence.cluster].hover || clusterStore.noClusterHovered('overall'))?{'opacity': 1}:{'opacity': .2}]">
                    <v-icon icon="mdi-plus-circle-outline" /> {{ sentence.text }}.
                  </p>
                </td>
              </tr>
            </v-table>
          </v-expansion-panel-text>
        </v-expansion-panel>
      </v-expansion-panels>
    </div>

    <div class="d-flex flex-column my-4">
      <CategoryPosNeg
        v-for="category in categoryStore.relevantCategories.sort((a, b) => b.value - a.value)"
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
  vertical-align: middle;
}
</style>