<script>
import CategoryPosNeg from "./CategoryPosNeg.vue";
import ChartPosNeg from "./ChartPosNeg.vue";
import { useHotelStore } from "../stores/hotel.js";
import {useReviewStore} from "../stores/review.js";
import { useCategoryStore } from "../stores/category.js";
import { useClusterStore } from "../stores/cluster.js";

export default {
  components: {
    CategoryPosNeg,
    ChartPosNeg,
  },
  setup() {
    const hotelStore = useHotelStore();
    const reviewStore = useReviewStore();
    const categoryStore = useCategoryStore();
    const clusterStore = useClusterStore();
    return { hotelStore, reviewStore, categoryStore, clusterStore };
  },
  computed: {},
  data: () => ({
    panel: [0, 1],
    subPanel: [0, 1],
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
                    :posNeg= "hotelStore.countsCategoryPosNeg('overall', hotelStore.selectedHotels)"
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
                <td class="pa-2 hotel-name">{{ hotel['name'] }}</td>
                <td class="pa-2 sentiment-text">
                  <v-dialog class="d-flex justify-content-center"
                      scrollable
                      width="auto"

                      v-for="sentence in hotelStore.sentimentSummary(hotel, 'overall', 'neg')"
                      :key="'overall_neg_'+hotel.id+'_'+sentence['idx_summary']">
                    <template v-slot:activator="{ props }">
                      <p v-bind="props"
                         @mouseenter="clusterStore.hover('overall', sentence['cluster'])"
                         @mouseleave="clusterStore.unhover('overall')"
                         :style="[(clusterStore.clustersById('overall')[sentence['cluster']]['hover'] || clusterStore.noClusterHovered('overall'))?{'opacity': 1}:{'opacity': .2}]">
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
                      :categoryId="'overall'"
                      :hotelId="hotel['id']"
                      :posNeg= "hotelStore.countsCategoryPosNeg('overall',[hotel])"
                      :color="'#999999'"
                      :width="100"
                      :height="50"
                      :xMin = "-6"
                      :xMax = "6"
                  ></ChartPosNeg>
                </td>
                <td class="pa-2 sentiment-text">
                  <v-dialog class="d-flex justify-content-center"
                            scrollable
                            width="auto"

                            v-for="sentence in hotelStore.sentimentSummary(hotel, 'overall', 'pos')"
                            :key="'overall_neg_'+hotel.id+'_'+sentence['idx_summary']">
                    <template v-slot:activator="{ props }">
                      <p v-bind="props"
                         @mouseenter="clusterStore.hover('overall', sentence['cluster'])"
                         @mouseleave="clusterStore.unhover('overall')"
                         :style="[(clusterStore.clustersById('overall')[sentence['cluster']]['hover'] || clusterStore.noClusterHovered('overall'))?{'opacity': 1}:{'opacity': .2}]">
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

    <div class="d-flex flex-column my-4">
      <CategoryPosNeg
        v-for="category in categoryStore.relevantCategories"
        :category="category"
        :key="'posneg_card_'+category.id"
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