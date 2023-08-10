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
  data () {
    return {
      isActive: false
    }
  },
  setup() {
    const hotelStore = useHotelStore();
    const categoryStore = useCategoryStore();
    const clusterStore = useClusterStore();
    const reviews = inject("reviews");
    const hotelMeta = inject("hotelMeta");
    const emitter = inject("emitter");
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
      hotelMeta,
      emitter,
      keywords,
    };
  },
  computed: {},
  mounted() {
    this.emitter.on(
        "close-popup",
        (params) => {
          this.isActive = false;
        }
    );
  },
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
    <p
      @mouseenter="
        categoryStore.hover(categoryId);
      "
      @mouseleave="
        categoryStore.unhover();
      "
      @click="isActive = !isActive"
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
    <v-dialog
        class="d-flex justify-content-center"
        scrollable
        width="auto"
        v-model="isActive"
    >
      <ReviewTextsPopup
          :hotelId = "hotelId"
          :categoryId = "categoryId"
          :polarity = "polarity"
          :sentence = "sentence"
          :indices = "sentence['idx_similar_reviews']"
          style="width: 50%"
        ></ReviewTextsPopup>
    </v-dialog>
</template>

