<script>
import { useHotelStore } from "../stores/hotel.js";
import { useClusterStore } from "../stores/cluster.js";
import { useCategoryStore } from "../stores/category";
import ReviewTextsPopup from "./ReviewTextsPopup.vue";
import { inject } from "vue";

export default {
  props: {
    hotelId: String,
    categoryId: String,
    polarity: String,
    sentence: Object,
  },
  components: {
    ReviewTextsPopup,
  },
  setup() {
    const hotelStore = useHotelStore();
    const categoryStore = useCategoryStore();
    const clusterStore = useClusterStore();
    const reviews = inject("reviews");
    const emitter = inject("emitter");
    const hotelMeta = inject("hotelMeta");
    const keywords = {
      "location": "location area neighborhood district city town street",
      "sleep": "sleep comfort bed pillow mattress",
      "value": "value price cost money",
      "rooms": "room size space",
      "service": "service friendliness staff",
      "cleanliness": "cleanliness clean dirty dust",
      }


    return {
      hotelStore,
      categoryStore,
      clusterStore,
      reviews,
      emitter,
      hotelMeta,
      keywords,
    };
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
      const textCleaned = text
        .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "")
        .toLowerCase()
        .split(" ");
      const wordCleaned = word
          .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "")
          .toLowerCase()
          .replace(/and|the|is|was|for/gi, "")
      let wordIncludesText = false;
      textCleaned.forEach((textWord) => {
        if (wordCleaned.includes(textWord)) {
          wordIncludesText = true;
        }
      });
      return textCleaned.includes(wordCleaned) || wordIncludesText
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
  >
    <template v-slot:activator="{ props }">
      <p
        v-bind="props"
        @mouseenter="
          categoryStore.hover(categoryId);
          highlight(categoryId, hotelId, sentence['cluster_size'], polarity)
        "
        @mouseleave="
          categoryStore.unhover();
          unhighlight(categoryId, hotelId)
        "
        :style="[
          {
            'font-weight': calcFontWeight(sentence['ratio_category']),
            'font-size': calcFontSize(sentence['ratio_category']),
            'opacity': (categoryStore.noCategoryHovered || categoryStore.categoriesById[categoryId].hover)?1:.2,
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
        {{ sentence["text"] }}.<v-icon icon="mdi-dots-horizontal" :style="[{ scale: .8 }]"/>
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
                reviews[hotelId]["review_count"],
              2
            ) + "% of reviews"
          }}</v-tooltip>
      </p>
    </template>
    <template v-slot:default="{ isActive }">
      <v-card style="width: 50%">
        <v-toolbar>
          <v-toolbar-title>{{
            hotelMeta[hotelId].name + " - " + sentence["text"]
          }}</v-toolbar-title>
        </v-toolbar>
        <v-card-text>
          <div class="text-h6">
            {{ reviews[hotelId]["reviews"][sentence["idx_review"]]["title"] }}
          </div>
          <span
            v-for="(word, index) in reviews[hotelId]['reviews'][
              sentence['idx_review']
            ]['text'].split(' ')"
            :style="[
              {
                'font-weight': matchText(keywords[categoryId] , word) ? 500 : 300,
                'font-size': matchText(keywords[categoryId] , word) ? '14pt' : '11pt',
                'color': matchText(keywords[categoryId] , word)? sentence['color'] : 'black',
              },
            ]"
            :key="index"
          >
            {{ word + " " }}
          </span>

          <br />
          <v-divider></v-divider>
          <br />

          <div class="text-h5">Similar Review Aspects for this Hotel</div>
          <br />
          <div v-for="review in sentence['idx_similar_reviews']" :key="review">
            <v-expansion-panels>
              <v-expansion-panel>
                <v-expansion-panel-title>
                  {{
                    reviews[hotelId]["reviews"][review["idx_review"]][
                      polarity + "_aspects"
                    ][review["idx_sentence"]]
                  }}
                </v-expansion-panel-title>
                <v-expansion-panel-text>
                  <span><b>
                    {{
                      reviews[hotelId]["reviews"][review["idx_review"]]["title"]
                    }}
                  </b></span>
                  <br/>
                  <span
                    v-for="(word, index) in reviews[hotelId]['reviews'][
                      review['idx_review']
                    ]['text'].split(' ')"
                    :style="[
                      {
                        'font-weight': matchText(keywords[categoryId] , word) ? 500 : 300,
                        'font-size': matchText(keywords[categoryId] , word) ? '14pt' : '11pt',
                        'color': matchText(keywords[categoryId] , word)? sentence['color'] : 'black',
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

