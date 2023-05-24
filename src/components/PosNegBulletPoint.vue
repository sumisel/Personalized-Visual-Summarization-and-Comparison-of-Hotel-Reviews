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
    calcFontSize: function (number) {
      if (number < .4) {
        return '5pt';
      } else if (number < .8) {
        return '8pt';
      } else {
        return '12pt';
      }
    },
    calcFontWeight: function (number) {
      if (number < .4) {
        return '100';
      } else if (number < .8) {
        return '300';
      } else {
        return '500';
      }
    },
    calcHover: function (hover, categoryId) {
      if (hover || this.clusterStore.noClusterHovered(categoryId)) {
        return 1;
      } else {
        return .2;
      }
    },
    highlight(categoryId, hotelId, num_items, polarity) {
      console.log('mouseenter highlight');
      this.emitter.emit("highlight_"+categoryId+'_'+hotelId.replaceAll('.', '_'), {categoryId, hotelId, num_items, polarity});
    },
    unhighlight(categoryId, hotelId) {
      this.emitter.emit("unhighlight_"+categoryId+'_'+hotelId.replaceAll('.', '_'), {categoryId, hotelId});
    },
  },
};

</script>

<template>
  <v-dialog class="d-flex justify-content-center"
            scrollable
            width="auto"
            v-for="sentence in hotelStore.sentimentSummary(hotel, categoryId, polarity)"
            :key="categoryId+'_'+polarity+'_'+hotel['id']+'_'+sentence['idx_summary']">
    <template v-slot:activator="{ props }">
      <p v-bind="props"
        @mouseenter="clusterStore.hover(sentence['category'], sentence['cluster']); highlight(categoryId, hotel['id'], 1+sentence['idx_similar_reviews'].length, polarity);"
        @mouseleave="clusterStore.unhover(sentence['category']); unhighlight(categoryId, hotel['id']);"
        :style="[{'font-weight': calcFontWeight(sentence['centrality_score']),
                  'font-size': calcFontSize(sentence['centrality_score']),
                  'opacity': calcHover(clusterStore.clustersById(sentence['category'])[sentence['cluster']]['hover'], sentence['category']),
                }]">
        <v-icon v-if="polarity=='pos'" icon="mdi-plus-circle-outline" :style="[{'color': sentence['color']}]"/><v-icon v-else icon="mdi-minus-circle-outline" :style="[{'color': sentence['color']}]"/>
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
