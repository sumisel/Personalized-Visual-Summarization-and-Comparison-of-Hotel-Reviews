<script>
import { useHotelStore } from "../stores/hotel.js";
import { useReviewStore }  from "../stores/review.js";
import { useClusterStore} from "../stores/cluster.js";
import { useCategoryStore} from "@/stores/category";

export default {
  props: {
    hotel: {
      type: Object,
      default: () => ({}),
    },
    categoryId: {
      type: String,
      default: "categoryId",
    },
    polarity: {
      type: String,
      default: "polarity",
    },
  },
  setup() {
    const hotelStore = useHotelStore();
    const reviewStore = useReviewStore();
    const categoryStore = useCategoryStore();
    const clusterStore = useClusterStore();
    return { hotelStore, reviewStore, categoryStore, clusterStore };
  },
  computed: {},
  methods:{
    roundToInt: function (number) {
      return number.toFixed(0);
    }
  },
};

</script>

<template>
  <v-dialog class="d-flex justify-content-center"
            scrollable
            width="auto"
            v-for="sentence in hotelStore.sentimentSummary(hotel, categoryId, polarity).slice(0, 5)"
            :key="categoryId+'_'+polarity+'_'+hotel['id']+'_'+sentence['idx_summary']">
    <template v-slot:activator="{ props }">
      <p v-bind="props"
        :style="[{'font-weight': roundToInt(500*sentence['centrality_score']),
        'font-size': 12*sentence['centrality_score']+'pt'}]">
         <!--
         @mouseenter="clusterStore.hover(categoryId, sentence['cluster'])"
         @mouseleave="clusterStore.unhover(categoryId)"
         :style="[(clusterStore.clustersById(categoryId)[sentence['cluster']]['hover'] || clusterStore.noClusterHovered(categoryId))?{'opacity': 1}:{'opacity': .2}]"
         -->
        <v-icon v-if="polarity=='pos'" icon="mdi-plus-circle-outline"/><v-icon v-else icon="mdi-minus-circle-outline"/>
        {{ sentence['text'] }}.
      </p>
    </template>
    <template v-slot:default="{ isActive }">
      <v-card style="width:30%;">
        <v-toolbar>
          <v-toolbar-title>{{ hotel['name'] +" - " + sentence['text'] }}</v-toolbar-title>
        </v-toolbar>
        <v-card-text>
          <div class="text-h6">{{reviewStore.reviewsById[hotel['id']][sentence['idx_review']]['title']}}</div>
          <div>{{reviewStore.reviewsById[hotel['id']][sentence['idx_review']]['text']}}</div>

          <br/>
          <v-divider></v-divider>
          <br/>

          <div class="text-h5">Similar Review Points for this Hotel</div>
          <br/>
          <div v-for="review in sentence['idx_similar_reviews']">
            <v-expansion-panels>
              <v-expansion-panel>
                <v-expansion-panel-title>
                  {{reviewStore.reviewsById[hotel['id']][review['idx_review']][polarity+'_aspects'][review['idx_sentence']]}}
                </v-expansion-panel-title>
                <v-expansion-panel-text>
                  <div>
                    {{reviewStore.reviewsById[hotel['id']][review['idx_review']]['text']}}
                  </div>
                </v-expansion-panel-text>
              </v-expansion-panel>
            </v-expansion-panels>
          </div>
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
</template>
