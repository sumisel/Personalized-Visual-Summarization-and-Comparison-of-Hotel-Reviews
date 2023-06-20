<script>
import CategoryPosNeg from "./CategoryPosNeg.vue";
import ChartPosNeg from "./ChartPosNeg.vue";
import PosNegBulletPoint from "./PosNegBulletPoint.vue";
import { useHotelStore } from "../stores/hotel.js";
import { useCategoryStore } from "../stores/category.js";

export default {
  components: {
    PosNegBulletPoint,
    CategoryPosNeg,
    ChartPosNeg,
  },
  setup() {
    const hotelStore = useHotelStore();
    const categoryStore = useCategoryStore();
    return { hotelStore, categoryStore };
  },
  computed: {},
  methods:{},
  data: () => ({
    panel: [0, 1],
  })
};

</script>

<template>
  <div class="ml-12">
    <div
        class="ma-2 flex-grow-1 w-90">
      <v-expansion-panels
          v-model="panel">
        <v-expansion-panel>
          <v-expansion-panel-title :key="'title_overall'">
            <v-row>
              <div class="pa-2 hotel-name">
                <b><u>Sentiment Overview</u></b>
              </div>
              <div class="pa-2 sentiment-text-title"></div>
              <div class="pa-2 ">
                <ChartPosNeg
                    :categoryId= "'overall'"
                    :hotelId= "'selected'"
                    :posNeg= "hotelStore.countsCategoryPosNeg('overall', hotelStore.selectedHotels)"
                    :color="'#999999'"
                    :width="200"
                    :height="20"
                    :xMin = "-6"
                    :xMax = "6"
                ></ChartPosNeg>
              </div>
              <div class="pa-2 sentiment-text-title"></div>
            </v-row>
          </v-expansion-panel-title>
          <v-expansion-panel-text>
            <v-table class="ma-2 flex-grow-1 w-90">
              <tr
                  v-for="hotel in hotelStore.selectedHotels" :key="'overall_'+hotel.id">
                <table>
                  <tr>
                    <td class="pa-2 hotel-name"></td>
                    <td colspan="3" class="sentiment-chart">
                      <ChartPosNeg
                          :categoryId="'overall'"
                          :hotelId="hotel['id']"
                          :posNeg= "hotelStore.countsCategoryPosNeg('overall',[hotel])"
                          :color="'#999999'"
                          :width="200"
                          :height="10"
                          :xMin = "-6"
                          :xMax = "6"
                      ></ChartPosNeg>
                    </td>
                  </tr>
                  <tr>
                    <td class="pa-2 hotel-name">{{ hotel['name'] }}</td>
                    <td class="pa-2 sentiment-text">
                      <PosNegBulletPoint
                          :hotel = "hotel"
                          :categoryId = "'overall'"
                          :polarity = "'neg'"
                          :key = "'neg_overall_bullet_points'">
                      </PosNegBulletPoint>
                    </td>
                    <td class="placeholder"></td>
                    <td class="pa-2 sentiment-text">
                      <PosNegBulletPoint
                          :hotel = "hotel"
                          :categoryId = "'overall'"
                          :polarity = "'pos'"
                          :key = "'pos_overall_bullet_points'">
                      </PosNegBulletPoint>
                    </td>
                  </tr>
                </table>
                <hr/>
              </tr>
            </v-table>
          </v-expansion-panel-text>
        </v-expansion-panel>
      </v-expansion-panels>
    </div>

    <div class="d-flex flex-column my-4">
      <CategoryPosNeg
        v-for="category in categoryStore.relevantCategories"
        :category="category"
        :key="'posneg_card_'+category['id']"
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
}
</style>