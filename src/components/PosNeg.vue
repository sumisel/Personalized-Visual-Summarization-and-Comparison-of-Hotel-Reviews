<script>
import ChartPosNeg from "./ChartPosNeg.vue";
import PosNegBulletPoint from "./PosNegBulletPoint.vue";
import HotelName from "./HotelName.vue";
import HotelAvatarInline from "./HotelAvatarInline.vue";
import InlineListItem from "../components/InlineListItem.vue";
import { useHotelStore } from "../stores/hotel.js";
import { useCategoryStore } from "../stores/category.js";
import { useClusterStore } from "../stores/cluster.js";
import { inject } from "vue";

export default {
  components: {
    InlineListItem,
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
  computed: {
    ratingVarietyDescription() {
      const counts = this.getOverallSentimentCounts();

      // compute variance of pos counts and neg counts
      let meanPos = 0;
      let meanNeg = 0;
      let varPos = 0;
      let varNeg = 0;
      counts.forEach((hotel) => {
        meanPos += hotel["posCount"]
        meanNeg += hotel["negCount"]
      });
      meanPos /= counts.length;
      meanNeg /= counts.length;
      counts.forEach((hotel) => {
        varPos += Math.pow(hotel["posCount"] - meanPos, 2);
        varNeg += Math.pow(hotel["negCount"] - meanNeg, 2);
      });
      varPos /= counts.length;
      varNeg /= counts.length;
      varPos = Math.sqrt(varPos);
      varNeg = Math.sqrt(varNeg);
      const v = (varPos + varNeg) / 2;

      if (v< 0.04) {
        return "almost identically";
      } else if (v < 0.08) {
        return "quite comparably";
      } else if (v < 0.13) {
        return "somewhat differently";
      } else if (v < 0.16) {
        return "quite variably";
      }
      return "with clear differences";
    },
    topReviewedHotels() {
      if (this.hotelStore.selectedHotelIdsSortedByRating.length === 0) {
        return [];
      }

      const counts = this.getOverallSentimentCounts();
      // sort counts by posCount
      counts.sort((a, b) => (b.posCount-b.negCount) - (a.posCount-a.negCount));

      // cut off if difference to best hotel is larger than 10%
      const bestRating = counts[0].posCount-counts[0].negCount;
      const topRatedHotels = counts.filter(
          (ratedHotel) => bestRating - (ratedHotel.posCount-ratedHotel.negCount) < 0.15*bestRating
      );
      return topRatedHotels.map((ratedHotel) => ratedHotel.name);
    },
  },
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
    getOverallSentimentCounts(){
      const hotels = this.hotelStore.selectedHotelIdsSortedByRating;
      let counts = [];
      hotels.forEach((hotelId) => {
        counts.push({
          name: hotelId,
          posCount: this.categoryStore.relevantCategories.map(c =>
              this.categoryStore.relevantCategories.length
              * this.categoryStore.normalizedCategoryValues[c["id"]]
              * this.reviews[hotelId]["counts"]["pos"][c["id"]])
              .reduce((a, b) => a + b, 0),
          negCount: this.categoryStore.relevantCategories.map(c =>
              this.categoryStore.relevantCategories.length
              * this.categoryStore.normalizedCategoryValues[c["id"]]
              * this.reviews[hotelId]["counts"]["neg"][c["id"]])
              .reduce((a, b) => a + b, 0),
        });
      });
      return counts;
    },
  },
};
</script>

<template>
  <div v-if="hotelStore.selectedHotelIds.length > 1">
    <div class="my-2 flex-grow-1">
      <p>
        <div class="pa-2" style="display: flex">
          <v-table class="sentiment-chart-title">
            <tr>
              <td style="display: flex; justify-content: center; font-weight: 100; font-size: 8pt; width: 500px">
                <v-icon icon="mdi-minus-circle-outline"/>
                &nbsp;
                &nbsp;
                <v-icon icon="mdi-plus-circle-outline"/>
              </td>
            </tr>
            <tr v-for="hotelId in hotelStore.selectedHotelIdsSortedByRating"
                class="overallChart"
              :key="'posneg_chart_'+ hotelId+'_overall_div'">
              <td class="d-flex">
                <ChartPosNeg
                    :categoryId="'overall'"
                    :hotelId="hotelId"
                    :color="'#999999'"
                    :width="500"
                    :height="10"
                    :xMin="-3.25"
                    :xMax="3.25"
                    :key="'posneg_chart_' + hotelId + '_overall'"
                ></ChartPosNeg>
                <HotelAvatarInline :hotelId="hotelId"></HotelAvatarInline>
              </td>
            </tr>
            <tr v-if="hotelStore.selectedHotelIdsSortedByRating.length>4">
              <td style="display: flex; justify-content: center; font-weight: 100; font-size: 8pt; width: 500px">
                <v-icon icon="mdi-minus-circle-outline"/>
                &nbsp;
                &nbsp;
                <v-icon icon="mdi-plus-circle-outline"/>
              </td>
            </tr>
          </v-table>
          <p class="summary" style="margin-left: 10pt">
            <span>
              In the reviews of the hotels, people mention the rating categories <b>{{ ratingVarietyDescription }}</b>.
            </span>
            <br/>
            <span v-if="topReviewedHotels.length > 0">
              <InlineListItem v-for="(hotel, index) in topReviewedHotels" :key="hotel" :index="index"
                              :listLength="topReviewedHotels.length">
                <strong>
                  <HotelAvatarInline :hotelId="hotel"></HotelAvatarInline>
                  {{ hotelMeta[hotel].name }}
                </strong>
              </InlineListItem>
              <span v-if="topReviewedHotels.length > 1"> have </span>
              <span v-else> has </span> the overall best ratio of positive to negative mentions.
            </span>
          </p>
        </div>
      </p>
      <v-card class="my-2 flex-grow-1"
          v-for="hotelId in hotelStore.selectedHotelIdsSortedByRating"
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
                    :xMin="-1.3"
                    :xMax="1.3"
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
  width: 55% !important;
  display: flex;
  align-items: center;
}
.summary {
  width: 45% !important;
}

.sentiment-chart {
  text-align: center;
  vertical-align: middle;
}
</style>