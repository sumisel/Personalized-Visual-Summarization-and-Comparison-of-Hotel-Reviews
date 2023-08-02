<script>
import ChartPosNeg from "./ChartPosNeg.vue";
import PosNegBulletPoint from "./PosNegBulletPoint.vue";
import HotelName from "./HotelName.vue";
import HotelAvatarInline from "./HotelAvatarInline.vue";
import { useHotelStore } from "../stores/hotel.js";
import { useCategoryStore } from "../stores/category.js";
import { useClusterStore } from "../stores/cluster.js";
import { inject } from "vue";

export default {
  components: {
    HotelAvatarInline,
    PosNegBulletPoint,
    ChartPosNeg,
    HotelName,
  },
  setup() {
    const hotelStore = useHotelStore();
    const categoryStore = useCategoryStore();
    const clusterStore = useClusterStore();
    const hotelMeta = inject("hotelMeta");
    const city = inject("city");
    const reviews = inject("reviews");
    return { hotelStore, categoryStore, clusterStore, hotelMeta, city, reviews };
  },
  computed: {},
  methods: {
    sentimentSummary(hotelId, category, prefix) {
      let summary = [];
      // compile sentences from all categories if it's the overall summary
      if (category == "overall") {
        for (let cat of this.categoryStore.relevantCategories) {
          let num_sentences = 0;
          if (cat["value"] > 33) {
            num_sentences = 1;
          }
          if (cat["value"] > 66) {
            num_sentences = 2;
          }
          let sentences = this.reviews[hotelId][prefix + "_summary"][cat["id"]]
              .sort((a, b) => a["idx_summary"] - b["idx_summary"])
              .slice(0, num_sentences);
          sentences.forEach((sentence, i) => {
            sentence["color"] = cat["color"];
            sentence["category"] = cat["id"];
          });
          summary.push(...sentences);
        }
      } else {
        summary = this.reviews[hotelId][prefix + "_summary"][category]
            .sort((a, b) => a["idx_summary"] - b["idx_summary"])
            .slice(0, 5);

        summary.forEach((sentence, i) => {
          sentence["color"] =
              this.categoryStore.categoriesById[category]["color"];
          sentence["category"] = category;
        });
      }
      summary.forEach((sentence, i) => {
        sentence["text"] =
            this.reviews[hotelId]["reviews"][sentence["idx_review"]][
            prefix + "_aspects"
                ][sentence["idx_sentence"]];
        sentence["idx_similar_reviews"].forEach((rev, j) => {
          rev["text"] =
              this.reviews[hotelId]["reviews"][rev["idx_review"]][prefix + "_aspects"][
                  rev["idx_sentence"]
                  ];
        });
      });
      return summary;
    },
  },
  data: () => ({
    panel: [0, 1],
  }),
};
</script>

<template>
  <div v-if="hotelStore.selectedHotelIds.length > 1">
    <div class="my-2 flex-grow-1">
      <p>
        <div class="pa-2" style="display: flex">
          <v-table class="sentiment-chart-title">
            <tr v-for="hotelId in hotelStore.selectedHotelIds"
              :key="'posneg_chart_'+ hotelId+'_overall_div'">
              <td class="d-flex">
                <ChartPosNeg
                    :categoryId="'overall'"
                    :hotelId="hotelId"
                    :color="'#999999'"
                    :width="400"
                    :height="10"
                    :xMin="-2"
                    :xMax="2"
                    :key="'posneg_chart_' + hotelId + '_overall'"
                ></ChartPosNeg>
                <HotelAvatarInline :hotelId="hotelId"></HotelAvatarInline>
              </td>
            </tr>
          </v-table>
          <span style="color: red; margin-left: 10pt">
            <b>This is a placeholder text for a short summary about the similarities and differences between the reviews of the hotels.</b>
          </span>
        </div>
      </p>
      <v-card class="my-2 flex-grow-1"
          v-for="hotelId in hotelStore.selectedHotelIds"
          :key="'overall_' + hotelId"
        >
          <div class="pa-2 hotel-name">
            <HotelName :hotelId="hotelId" avatar></HotelName>
          </div>
          <v-table class="pa-2 my-2 flex-grow-1">
            <tr
                v-for="category in categoryStore.relevantCategories"
                :key="'posneg_' + hotelId + '_' + category['id']"
            >
              <td class="sentiment-text-neg">
                <v-table>
                  <tr
                      v-for="sentence in sentimentSummary(hotelId, 'overall', 'neg')
                  // filter to only show clusters with more than 1% of reviews
                  .filter(
                    (s) =>
                      s['cluster_size'] > this.reviews[hotelId].review_count * 0.01
                      &&
                      s['category'] == category['id']
                  )"
                      :key="
                      category['id'] +
                      '_' +
                      'neg' +
                      '_' +
                      hotelId +
                      '_' +
                      sentence['idx_summary']
                    "
                  >
                    <td>
                      <PosNegBulletPoint
                          :hotelId="hotelId"
                          :categoryId="category['id']"
                          :polarity="'neg'"
                          :sentence = "sentence"
                          :key="'neg_' + hotelId + '_' + category['id']"
                      >
                      </PosNegBulletPoint>
                    </td>
                  </tr>
                </v-table>
              </td>

              <td class="sentiment-chart"
                  :style="[{'opacity': (categoryStore.noCategoryHovered || categoryStore.categoriesById[category['id']].hover)?1:.2}]"
                  @mouseenter="categoryStore.hover(category['id'])"
                  @mouseleave="categoryStore.unhover();">
                <ChartPosNeg
                    :categoryId="category['id']"
                    :hotelId="hotelId"
                    :color="category['color']"
                    :width="200"
                    :height="10"
                    :xMin="-1"
                    :xMax="1"
                    :key="'posneg_chart_' + hotelId + '_' + category['id']"
                ></ChartPosNeg>
              </td>

              <td class="sentiment-text-pos">
                <v-table>
                  <tr
                      v-for="sentence in sentimentSummary(hotelId, 'overall', 'pos')
                  // filter to only show clusters with more than 1% of reviews
                  .filter(
                    (s) =>
                      s['cluster_size'] > this.reviews[hotelId].review_count * 0.01
                      &&
                      s['category'] == category['id']
                  )"
                      :key="
                      category['id'] +
                      '_' +
                      'neg' +
                      '_' +
                      hotelId +
                      '_' +
                      sentence['idx_summary']
                    "
                  >
                    <td>
                      <PosNegBulletPoint
                          :hotelId="hotelId"
                          :categoryId="category['id']"
                          :polarity="'pos'"
                          :sentence = "sentence"
                          :key="'neg_' + hotelId + '_' + category['id']"
                      >
                      </PosNegBulletPoint>
                    </td>
                  </tr>
                </v-table>
              </td>
            </tr>
          </v-table>
      </v-card>
    </div>

  </div>
</template>

<style>
.hotel-name {
  width: 30% !important;
}

.sentiment-text-neg {
  width: 38% !important;
  text-align: right;
  align-content: end;
}
.sentiment-text-pos {
  width: 38% !important;
}

.placeholder {
  width: 5% !important;
}

.sentiment-chart-title{
  width: 65% !important;
  display: flex;
  align-items: center;
}

.sentiment-chart {
  text-align: center;
  vertical-align: middle;
}
</style>