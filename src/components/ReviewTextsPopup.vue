<script>
import { useHotelStore } from "../stores/hotel.js";
import { useCategoryStore } from "../stores/category";
import { inject } from "vue";
import CategoryName from "./CategoryName.vue";
import HotelAvatarInline from "./HotelAvatarInline.vue";
import HotelName from "@/components/HotelName.vue";
import Glyph from "@/components/Glyph.vue";

export default {
  components: {Glyph, HotelName, HotelAvatarInline, CategoryName},
  props: {
    hotelId: String,
    categoryId: String,
    polarity: String,
    sentence: Object,
    date: String,
    minRatings: Object,
    indices: Array,
  },
  setup() {
    const hotelStore = useHotelStore();
    const categoryStore = useCategoryStore();
    const reviews = inject("reviews");
    const hotelMeta = inject("hotelMeta");
    const emitter = inject("emitter");
    const keywords = inject("keywords");

    return {
      hotelStore,
      categoryStore,
      reviews,
      hotelMeta,
      emitter,
      keywords,
    };
  },
  computed: {},
  methods: {
    matchText(text, word) {
      if(!text){
        return false;
      }
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
    sortReviews() {
      // for the trending popup, sort by category value
      const reviews = Object.assign({}, this.reviews[this.hotelId]['reviews'], this.reviews[this.hotelId]['reviews_unannotated'])
      if(!this.sentence){
        if(this.categoryId == 'average'){
          const weights = this.categoryStore.normalizedCategoryValues;
          this.indices.sort((a, b) => {
            return (
                Object.keys(reviews[b["idx_review"]]["property_dict"]).reduce((m, n) => {return m+reviews[b["idx_review"]]["property_dict"][n]*weights[n]}, 0)
                - Object.keys(reviews[a["idx_review"]]["property_dict"]).reduce((m, n) => {return m+reviews[a["idx_review"]]["property_dict"][n]*weights[n]}, 0)
            );
          });
        } else {
          this.indices.sort((a, b) => {
            return (
                reviews[b["idx_review"]]["property_dict"][this.categoryId]
                - reviews[a["idx_review"]]["property_dict"][this.categoryId]
            );
          });
        }
      }
      return this.indices;
    },
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
  }
};
</script>

<template>
    <v-card>
      <div class="pa-3">
        <HotelName :hotelId="hotelId" avatar></HotelName>
        &nbsp;
        <div style="display: inline-block"
             v-if="sentence"
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
              :style="[{ 'color': sentence['color'] }]"
          />
          <v-icon
            v-else
            icon="mdi-minus-circle-outline"
            :style="[{ color: sentence['color'] }]"
          />
          &nbsp;
          <div style="display: inline-block">
            {{ sentence["text"] }}
          </div>
        </div>
        <div style="display: inline-block" v-else>
          <CategoryName v-if="categoryId!='average'" :categoryId="categoryId"/>
          &nbsp;
          {{ date }}</div>
      </div>
      <v-card-text>
        <div v-if = "sentence">
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
        </div>

        <div v-for="review in sortReviews()" :key="review"  >
          <v-expansion-panels>
            <v-expansion-panel>
              <v-expansion-panel-title v-if="sentence">
                <div>
                  {{
                    reviews[hotelId]["reviews"][review["idx_review"]][
                    polarity + "_aspects"
                        ][review["idx_sentence"]]
                  }}
                </div>
              </v-expansion-panel-title>
              <v-expansion-panel-title v-else>
                <Glyph
                    :ratings="Object.assign({}, reviews[hotelId]['reviews'], reviews[hotelId]['reviews_unannotated'])
                        [review['idx_review']]
                        ['property_dict']"
                    :minRatings="minRatings"
                    :height="40"
                    :width="40"></Glyph>
                <div class="pa-1">
                  {{
                    Object.assign({}, reviews[hotelId]["reviews"], reviews[hotelId]["reviews_unannotated"])[review["idx_review"]]["title"]
                  }}
                </div>
              </v-expansion-panel-title>
              <v-expansion-panel-text>
                <span
                  v-for="(word, index) in Object.assign({}, reviews[hotelId]['reviews'], reviews[hotelId]['reviews_unannotated'])[
                    review['idx_review']
                  ]['text'].split(' ')"
                  :style="[
                    {
                      'font-weight': matchText(keywords[categoryId] , word) ? 500 : 300,
                      'font-size': matchText(keywords[categoryId] , word) ? '14pt' : '11pt',
                      'color': matchText(keywords[categoryId] , word)? categoryStore.categoriesById[categoryId]['color'] : 'black',
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
        <v-btn variant="text" @click="this.emitter.emit('close-popup')">Close</v-btn>
      </v-card-actions>
    </v-card>
</template>

