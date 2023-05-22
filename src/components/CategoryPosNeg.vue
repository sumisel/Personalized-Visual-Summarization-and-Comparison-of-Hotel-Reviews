<script setup xmlns="http://www.w3.org/1999/html">
import { computed } from "vue";

import CategoryName from "./CategoryName.vue";

import { useHotelStore } from "../stores/hotel.js";
import { useReviewStore }  from "../stores/review.js";
import { useCategoryStore } from "../stores/category.js";
import { useClusterStore } from "../stores/cluster.js";
import ChartPosNeg from "@/components/ChartPosNeg.vue";

const hotelStore = useHotelStore();
const reviewStore = useReviewStore();
const categoryStore = useCategoryStore();
const clusterStore = useClusterStore();

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
          <v-expansion-panel-title :key="'title_'+category.id"
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
                    :xMin = "-30"
                    :xMax = "30"
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
                <v-dialog class="d-flex justify-content-center"
                          scrollable
                          width="auto"

                          v-for="sentence in hotelStore.sentimentSummary(hotel, category['id'], 'neg')"
                          :key="category['id']+'_neg_'+hotel['id']+'_'+sentence['idx']">
                  <template v-slot:activator="{ props }">
                    <p v-bind="props"
                       @mouseenter="clusterStore.hover(category['id'], sentence['cluster'])"
                       @mouseleave="clusterStore.unhover(category['id'])"
                       :style="[(clusterStore.clustersById(category['id'])[sentence['cluster']]['hover'] || clusterStore.noClusterHovered(category['id']))?{'opacity': 1}:{'opacity': .2}]">
                      <v-icon icon="mdi-minus-circle-outline"/> {{ sentence['text'] }}.
                    </p>
                  </template>
                  <template v-slot:default="{ isActive }">
                    <v-card style="width:30%;">
                      <v-toolbar>
                        <v-toolbar-title>{{ hotel['name'] }}</v-toolbar-title>
                      </v-toolbar>
                      <v-card-text>
                        <div class="text-h6">{{reviewStore.reviewsById[hotel['id']][sentence['idx_review']]['title']}}</div>
                        <div>{{reviewStore.reviewsById[hotel['id']][sentence['idx_review']]['text']}}</div>

                        <br/>
                        <v-divider></v-divider>
                        <br/>

                        <div class="text-h5">Similar Reviews for this Hotel</div>
                        <br/>

                        <v-expansion-panels
                            v-model="subPanel">
                          <v-expansion-panel v-for="review in sentence['idx_similar_reviews']">
                            <v-expansion-panel-title>
                              {{reviewStore.reviewsById[hotel['id']][review['idx_review']]['title']}}
                            </v-expansion-panel-title>
                            <v-expansion-panel-text>
                              <div>
                                {{reviewStore.reviewsById[hotel['id']][review['idx_review']]['text']}}
                              </div>
                            </v-expansion-panel-text>
                          </v-expansion-panel>
                        </v-expansion-panels>
                      </v-card-text>
                      <v-card-actions class="justify-end">
                        <v-btn
                            variant="text"
                            @click="isActive.value = false"
                        >Close</v-btn>
                      </v-card-actions>
                    </v-card>
                  </template>
                </v-dialog>

              </td>
              <td class="sentiment-chart">
                <ChartPosNeg
                    :categoryId="category['id']"
                    :hotelId = "hotel['id']"
                    :posNeg= "hotelStore.countsCategoryPosNeg(category['id'], [hotel])"
                    :color="category['color']"
                    :width="100"
                    :height="50"
                    :xMin = "-30"
                    :xMax = "30"
                ></ChartPosNeg>
              </td>
              <td class="pa-2 sentiment-text">
                <v-dialog class="d-flex justify-content-center"
                          scrollable
                          width="auto"

                          v-for="sentence in hotelStore.sentimentSummary(hotel, category['id'], 'pos')"
                          :key="category['id']+'_pos_'+hotel['id']+'_'+sentence['idx']">
                  <template v-slot:activator="{ props }">
                    <p v-bind="props"
                       @mouseenter="clusterStore.hover(category['id'], sentence['cluster'])"
                       @mouseleave="clusterStore.unhover(category['id'])"
                       :style="[(clusterStore.clustersById(category['id'])[sentence['cluster']]['hover'] || clusterStore.noClusterHovered(category['id']))?{'opacity': 1}:{'opacity': .2}]">
                      <v-icon icon="mdi-minus-circle-outline"/> {{ sentence['text'] }}.
                    </p>
                  </template>
                  <template v-slot:default="{ isActive }">
                    <v-card style="width:30%;">
                      <v-toolbar>
                        <v-toolbar-title>{{ hotel['name'] }}</v-toolbar-title>
                      </v-toolbar>
                      <v-card-text>
                        <div class="text-h6">{{reviewStore.reviewsById[hotel['id']][sentence['idx_review']]['title']}}</div>
                        <div>{{reviewStore.reviewsById[hotel['id']][sentence['idx_review']]['text']}}</div>

                        <br/>
                        <v-divider></v-divider>
                        <br/>

                        <div class="text-h5">Similar Reviews for this Hotel</div>
                        <br/>

                        <v-expansion-panels
                            v-model="subPanel">
                          <v-expansion-panel v-for="review in sentence['idx_similar_reviews']">
                            <v-expansion-panel-title>
                              {{reviewStore.reviewsById[hotel['id']][review['idx_review']]['title']}}
                            </v-expansion-panel-title>
                            <v-expansion-panel-text>
                              <div>
                                {{reviewStore.reviewsById[hotel['id']][review['idx_review']]['text']}}
                              </div>
                            </v-expansion-panel-text>
                          </v-expansion-panel>
                        </v-expansion-panels>
                      </v-card-text>
                      <v-card-actions class="justify-end">
                        <v-btn
                            variant="text"
                            @click="isActive.value = false"
                        >Close</v-btn>
                      </v-card-actions>
                    </v-card>
                  </template>
                </v-dialog>
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
