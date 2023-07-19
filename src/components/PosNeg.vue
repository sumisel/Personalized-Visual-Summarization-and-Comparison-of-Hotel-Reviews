<script>
import CategoryPosNeg from "./CategoryPosNeg.vue";
import ChartPosNeg from "./ChartPosNeg.vue";
import PosNegBulletPoint from "./PosNegBulletPoint.vue";
import { useHotelStore } from "../stores/hotel.js";
import { useCategoryStore } from "../stores/category.js";
import { useClusterStore } from "../stores/cluster.js";
import { inject } from "vue";

export default {
  components: {
    PosNegBulletPoint,
    CategoryPosNeg,
    ChartPosNeg,
  },
  setup() {
    const hotelStore = useHotelStore();
    const categoryStore = useCategoryStore();
    const clusterStore = useClusterStore();
    const hotelMeta = inject("hotelMeta");
    const city = inject("city");
    return { hotelStore, categoryStore, clusterStore, hotelMeta, city };
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
  },
  data: () => ({
    panel: [0, 1],
  }),
};
</script>

<template>
  <div v-if="hotelStore.selectedHotelIds.length > 1">
    <div class="my-2 flex-grow-1">
      <v-expansion-panels v-model="panel">
        <v-expansion-panel>
          <v-expansion-panel-title :key="'title_overall'">
            <v-row>
              <div class="pa-2 hotel-name">
                <b><u>Sentiment Overview</u></b>
              </div>
              <div class="pa-2 sentiment-text-title"></div>
              <div class="pa-2">
                <ChartPosNeg
                  :categoryId="'overall'"
                  :hotelId="'selected'"
                  :posNeg="
                    countsCategoryPosNeg('overall', hotelStore.selectedHotelIds)
                  "
                  :color="'#999999'"
                  :width="200"
                  :height="20"
                  :xMin="-6"
                  :xMax="6"
                ></ChartPosNeg>
              </div>
              <div class="pa-2 sentiment-text-title"></div>
            </v-row>
          </v-expansion-panel-title>
          <v-expansion-panel-text>
            <v-table class="my-2 flex-grow-1">
              <template
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
                    <v-avatar color="#eee" :image="`./img/hotels/${city.name
                      .replace(' ', '_')
                      .toLowerCase()}/${hotelId}.png`">
                    </v-avatar>
                    <br/>
                    {{ hotelMeta[hotelId].name }}</td>
                  <td class="pa-2 sentiment-text">
                    <PosNegBulletPoint
                      :hotelId="hotelId"
                      :categoryId="'overall'"
                      :polarity="'neg'"
                      :key="'neg_overall_bullet_points'"
                    >
                    </PosNegBulletPoint>
                  </td>
                  <td class="placeholder"></td>
                  <td class="pa-2 sentiment-text">
                    <PosNegBulletPoint
                      :hotelId="hotelId"
                      :categoryId="'overall'"
                      :polarity="'pos'"
                      :key="'pos_overall_bullet_points'"
                    >
                    </PosNegBulletPoint>
                  </td>
                </tr>
              </template>
            </v-table>
          </v-expansion-panel-text>
        </v-expansion-panel>
      </v-expansion-panels>
    </div>

    <div class="d-flex flex-column my-4">
      <CategoryPosNeg
        v-for="category in categoryStore.relevantCategories"
        :category="category"
        :key="'posneg_card_' + category['id']"
        @mouseenter="categoryStore.hover(category['id'])"
        @mouseleave="categoryStore.unhover()"
      ></CategoryPosNeg>
    </div>
  </div>
</template>

<style>
.hotel-name {
  width: 15% !important;
}

.sentiment-text-title {
  width: 31.3% !important;
}

.sentiment-text {
  width: 40% !important;
}

.placeholder {
  width: 5% !important;
}

.sentiment-chart {
  width: 100% !important;
  text-align: center;
  vertical-align: middle;
  border-top: 1px solid grey;
}
</style>