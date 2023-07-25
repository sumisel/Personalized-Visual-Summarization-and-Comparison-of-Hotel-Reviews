<script>
import CategoryPosNeg from "./CategoryPosNeg.vue";
import ChartPosNeg from "./ChartPosNeg.vue";
import PosNegBulletPoint from "./PosNegBulletPoint.vue";
import HotelName from "./HotelName.vue";
import { useHotelStore } from "../stores/hotel.js";
import { useCategoryStore } from "../stores/category.js";
import { useClusterStore } from "../stores/cluster.js";
import { inject } from "vue";

export default {
  components: {
    PosNegBulletPoint,
    CategoryPosNeg,
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
    countsCategoryPosNeg: (category, hotelIds) => {
      const reviews = inject("reviews");
      let counts = [];
      hotelIds.forEach((hotelId) => {
        counts.push({
          name: hotelId,
          posCount: reviews[hotelId]["counts"]["pos"][category],
          negCount: reviews[hotelId]["counts"]["neg"][category],
        });
      });
      return counts;
    },
    sentimentSummary(hotelId, category, prefix) {
      const reviews = inject("reviews");
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
          let sentences = reviews[hotelId][prefix + "_summary"][cat["id"]]
              .sort((a, b) => a["idx_summary"] - b["idx_summary"])
              .slice(0, num_sentences);
          sentences.forEach((sentence, i) => {
            sentence["color"] = cat["color"];
            sentence["category"] = cat["id"];
          });
          summary.push(...sentences);
        }
      } else {
        summary = reviews[hotelId][prefix + "_summary"][category]
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
            reviews[hotelId]["reviews"][sentence["idx_review"]][
            prefix + "_aspects"
                ][sentence["idx_sentence"]];
        sentence["idx_similar_reviews"].forEach((rev, j) => {
          rev["text"] =
              reviews[hotelId]["reviews"][rev["idx_review"]][prefix + "_aspects"][
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
        <span>
          This is a placeholder text for a short summary about the similarities and differences between in reviews of the different hotels.
        </span>
      </p>
      <v-table class="my-2 flex-grow-1">
        <v-card  class="my-2 flex-grow-1"
          v-for="hotelId in hotelStore.selectedHotelIds"
          :key="'overall_' + hotelId"
        >
          <tr>
            <td class="pa-2 hotel-name"></td>
            <td colspan="3" class="sentiment-chart">
              <ChartPosNeg
                :categoryId="'overall'"
                :hotelId="hotelId"
                :posNeg="countsCategoryPosNeg('overall', [hotelId])"
                :color="'#999999'"
                :width="200"
                :height="10"
                :xMin="-6"
                :xMax="6"
              ></ChartPosNeg>
            </td>
          </tr>
          <tr>
            <td class="pa-2 hotel-name">
              <HotelName :hotelId="hotelId" avatar line-break></HotelName></td>
            <td class="pa-2">
              <v-table class="my-2 flex-grow-1">
                <tr
                    v-for="category in categoryStore.relevantCategories"
                    :category="category"
                    :key="'posneg_' + hotelId + '_' + category['id']"
                >
                  <td class="sentiment-text">
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

                  <td class="placeholder"></td>

                  <td class="sentiment-text">
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

            </td>
          </tr>
        </v-card>
      </v-table>
    </div>

  </div>
</template>

<style>
.hotel-name {
  width: 20% !important;
}

.sentiment-text {
  width: 38% !important;
}

.placeholder {
  width: 5% !important;
}

.sentiment-chart {
  width: 100% !important;
  text-align: center;
  vertical-align: middle;
}
</style>