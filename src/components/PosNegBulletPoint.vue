<script>
import { useHotelStore } from "../stores/hotel.js";
import { useClusterStore } from "../stores/cluster.js";
import { useCategoryStore } from "../stores/category";

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
    const categoryStore = useCategoryStore();
    const clusterStore = useClusterStore();
    return { hotelStore, categoryStore, clusterStore };
  },
  computed: {},
  methods: {
    calcFontSize: function (number) {
      if (number < 0.25) {
        return "8pt";
      } else if (number < 0.5) {
        return "11pt";
      } else {
        return "14pt";
      }
    },
    calcFontWeight: function (number) {
      if (number < 0.25) {
        return "100";
      } else if (number < 0.5) {
        return "300";
      } else {
        return "500";
      }
    },
    calcHover: function (hover, categoryId) {
      if (hover || this.clusterStore.noClusterHovered(categoryId)) {
        return 1;
      } else {
        return 0.2;
      }
    },
    highlight(categoryId, hotelId, num_items, polarity) {
      console.log("mouseenter highlight");
      this.emitter.emit(
        "highlight_" + categoryId + "_" + hotelId.replaceAll(".", "_"),
        { categoryId, hotelId, num_items, polarity }
      );
    },
    unhighlight(categoryId, hotelId) {
      this.emitter.emit(
        "unhighlight_" + categoryId + "_" + hotelId.replaceAll(".", "_"),
        { categoryId, hotelId }
      );
    },

    matchText(text, word) {
      return text
        .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "")
        .toLowerCase()
        .split(" ")
        .includes(
          word
            .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "")
            .toLowerCase()
            .replace(/and|the|is|was|for/gi, "")
        );
    },
    roundToDecimal: function (number, decimals) {
      return number.toFixed(decimals);
    },
  },
};
</script>

<template>
  <v-dialog
    class="d-flex justify-content-center"
    scrollable
    width="auto"
    v-for="sentence in hotelStore
      .sentimentSummary(hotel, categoryId, polarity)
      // filter to only show clusters with more than 1% of reviews
      .filter(
        (sentence) =>
          sentence['cluster_size'] > this.$reviews[hotel.id].review_count * 0.01
      )"
    :key="
      categoryId +
      '_' +
      polarity +
      '_' +
      hotel['id'] +
      '_' +
      sentence['idx_summary']
    "
  >
    <template v-slot:activator="{ props }">
      <!--@mouseenter="clusterStore.hover(sentence['category'], sentence['cluster']); highlight(categoryId, hotel['id'], sentence['cluster_size'], polarity);"
        @mouseleave="clusterStore.unhover(sentence['category']); unhighlight(categoryId, hotel['id']);"
                  'opacity': calcHover(clusterStore.clustersById(sentence['category'])[sentence['cluster']]['hover'], sentence['category']),-->
      <p
        v-bind="props"
        @mouseenter="
          highlight(categoryId, hotel['id'], sentence['cluster_size'], polarity)
        "
        @mouseleave="unhighlight(categoryId, hotel['id'])"
        :style="[
          {
            'font-weight': calcFontWeight(sentence['ratio_category']),
            'font-size': calcFontSize(sentence['ratio_category']),
          },
        ]"
      >
        <v-icon
          v-if="polarity == 'pos'"
          icon="mdi-plus-circle-outline"
          :style="[{ color: sentence['color'] }]"
        /><v-icon
          v-else
          icon="mdi-minus-circle-outline"
          :style="[{ color: sentence['color'] }]"
        />
        {{ sentence["text"] }}.
        <v-tooltip activator="parent" location="bottom" max-width="300px">
          {{
            roundToDecimal(100 * sentence["ratio_category"], 2) +
            "% of " +
            sentence["category"] +
            " mentions"
          }}
          <br />
          {{
            roundToDecimal(
              (100 * sentence["cluster_size"]) /
                $reviews[hotel["id"]]["review_count"],
              2
            ) + "% of reviews"
          }}
          <br />
          {{
            roundToDecimal(sentence["centrality_score"], 2) +
            " centrality score within cluster of similar reviews"
          }}</v-tooltip
        >
      </p>
    </template>
    <template v-slot:default="{ isActive }">
      <v-card style="width: 30%">
        <v-toolbar>
          <v-toolbar-title>{{
            hotel["name"] + " - " + sentence["text"]
          }}</v-toolbar-title>
        </v-toolbar>
        <v-card-text>
          <div class="text-h6">
            {{
              $reviews[hotel["id"]]["reviews"][sentence["idx_review"]]["title"]
            }}
          </div>
          <span
            v-for="(word, index) in $reviews[hotel['id']]['reviews'][
              sentence['idx_review']
            ]['text'].split(' ')"
            :style="[
              {
                'font-weight': calcFontWeight(
                  matchText(sentence['text'], word) ? 1 : 0
                ),
                'font-size': calcFontSize(
                  matchText(sentence['text'], word) ? 1 : 0.9
                ),
                color: matchText(sentence['text'], word)
                  ? sentence['color']
                  : 'black',
              },
            ]"
            :key="index"
          >
            {{ word + " " }}
          </span>

          <br />
          <v-divider></v-divider>
          <br />

          <div class="text-h5">Similar Review Points for this Hotel</div>
          <br />
          <div v-for="review in sentence['idx_similar_reviews']" :key="review">
            <v-expansion-panels>
              <v-expansion-panel>
                <v-expansion-panel-title>
                  {{
                    $reviews[hotel["id"]]["reviews"][review["idx_review"]][
                      polarity + "_aspects"
                    ][review["idx_sentence"]]
                  }}
                </v-expansion-panel-title>
                <v-expansion-panel-text>
                  <span
                    v-for="(word, index) in $reviews[hotel['id']]['reviews'][
                      review['idx_review']
                    ]['text'].split(' ')"
                    :style="[
                      {
                        'font-weight': calcFontWeight(
                          matchText(
                            $reviews[hotel['id']]['reviews'][
                              review['idx_review']
                            ][polarity + '_aspects'][review['idx_sentence']],
                            word
                          )
                            ? 1
                            : 0
                        ),
                        'font-size': calcFontSize(
                          matchText(
                            $reviews[hotel['id']]['reviews'][
                              review['idx_review']
                            ][polarity + '_aspects'][review['idx_sentence']],
                            word
                          )
                            ? 1
                            : 0.9
                        ),
                        color: matchText(
                          $reviews[hotel['id']]['reviews'][
                            review['idx_review']
                          ][polarity + '_aspects'][review['idx_sentence']],
                          word
                        )
                          ? sentence['color']
                          : 'black',
                      },
                    ]"
                    :key="index"
                  >
                    {{ word + " " }}
                  </span>
                </v-expansion-panel-text>
              </v-expansion-panel>
            </v-expansion-panels>
          </div>
        </v-card-text>
        <v-card-actions class="justify-end">
          <v-btn variant="text" @click="isActive.value = false">Close</v-btn>
        </v-card-actions>
      </v-card>
    </template>
  </v-dialog>
</template>
