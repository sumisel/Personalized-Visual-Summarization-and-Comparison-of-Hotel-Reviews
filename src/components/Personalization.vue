<script setup>
import Glyph from "./Glyph.vue";

import { storeToRefs } from "pinia";
import { useCategoryStore } from "../stores/category.js";
import { usePoiStore } from "../stores/poi";
import { useInterfaceStore } from "../stores/interface.js";
import { inject } from "vue";
import PoiChip from "./PoiChip.vue";
const categoryStore = useCategoryStore();
const { categories } = storeToRefs(categoryStore);
const poiStore = usePoiStore();
const interfaceStore = useInterfaceStore();
const poiMeta = inject("poiMeta");
const keywordsDescriptions =  {
  "location": "Location customer ratings include the location of the hotel, the surrounding area and, and the proximity to points of interest.",
  "sleep": "Customer ratings in this category include the quality of the bed, the noise level, and the temperature of the room.",
  "value": "Value customer ratings include the price, the value for money, and the quality of the breakfast.",
  "rooms": "Customer ratings for the rooms regard the size of the room, the quality of the bathroom and other facilities, and the view.",
  "service": "Service customer ratings include the friendliness of the staff, the quality of the room service, and the check-in and check-out experience.",
  "cleanliness": "Cleanliness customer ratings refer to the cleanliness of the room, the bathroom, and the hotel in general.",
};
</script>

<template>
  <v-sheet class="pa-4">
    <div class="text-h4 my-4">I. My Preferences</div>
    <div class="my-12">
      <div class="text-h6 mb-4">
        <v-icon>mdi-map-marker-radius</v-icon> Points of Interest
      </div>
      <v-autocomplete label="Choose your favorites" :items="Object.keys(poiMeta)" v-model="poiStore.selectedPois" chips
        closable-chips multiple>
        <template v-slot:chip="{ props, item }">
          <PoiChip :poi="item.raw" v-bind="props"></PoiChip>
        </template>
        <template v-slot:item="{ props, item }">
          <v-list-item v-bind="props" :prepend-icon="poiMeta[item.raw].icon"
            :title="item.raw.replaceAll('_', ' ')"></v-list-item>
        </template>
      </v-autocomplete>
      <v-overlay activator="parent" v-model="interfaceStore.tutorialStep.poi" location-strategy="connected"
        :open-on-click="false" location="start top" offset="25" persistent class="instructions">
        <v-card class="pa-2">
          <v-card-text><v-icon icon="mdi-arrow-left" class="inline"></v-icon> Here, you can select what's
            your preferences regarding the location. This will help you to select the most promising candidate hotels on
            the map.</v-card-text>
          <v-card-actions>
            <v-btn text
              @click="interfaceStore.tutorialStep.poi = false; interfaceStore.tutorialStep.priorities = true">Ok</v-btn>
          </v-card-actions>
        </v-card>
      </v-overlay>
    </div>
    <div class="my-12">
      <div class="text-h6 mb-4"><v-icon>mdi-sort</v-icon> Category Priorities</div>
      <div class="d-flex justify-center">
        <Glyph></Glyph>
        <div>
          <v-icon icon="mdi-information-outline" size="small"></v-icon><v-tooltip activator="parent" location="bottom"
            max-width="300px">For every hotel, such a radial diagram shows the ratings across all
            categories. For comparison, the bright area in the middle indicates
            the mininum rating of a category among the currently selected hotels. Slices are scaled according to
            priorities, as well as the overall
            rating in the center is weighted by these priorities.</v-tooltip>
        </div>
      </div>
      <v-table density="compact">
        <thead>
          <tr>
            <th class="text-left">Review category</th>
            <th class="text-left w-50">Priority</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="category in categories" :key="category.id" :class="{ hover: category.hover }"
            @mouseenter="categoryStore.hover(category.id)" @mouseleave="categoryStore.unhover()"
            :style="[{'opacity': (categoryStore.noCategoryHovered || categoryStore.categoriesById[category.id].hover)?1:.2},]">
            <td>
              <v-icon :icon="category.icon" class="mr-2" :color="category.color"></v-icon>{{ category.title }}
            </td>
            <td>
              <v-slider :color="category.color" v-model="category.value" hide-details="true" thumb-size="12"
                track-size="2" min="0.01"></v-slider>
            </td>
            <v-tooltip activator="parent" location="bottom" max-width="300px">
                {{keywordsDescriptions[category.id]}}</v-tooltip>
          </tr>
        </tbody>
      </v-table>
      <v-overlay activator="parent" v-model="interfaceStore.tutorialStep.priorities" location-strategy="connected"
        :open-on-click="false" location="start top" offset="25" persistent class="instructions">
        <v-card class="pa-2">
          <v-card-text>
            <p><v-icon icon="mdi-arrow-left" class="inline"></v-icon> The radial diagram summarizes the ratings for each
              hotel in the comparison. The length of each segment from the circle center shows the rating of the hotel per
              category. The brighter areas in the middle indicate the minimum rating per category across all currently
              selected hotels.</p>
            <div class="mx-auto text-center">
              <Glyph :ratings="{
                location: 4.7,
                value: 4.5,
                rooms: 4.5,
                service: 4.1,
                cleanliness: 3.9,
                sleep: 4.9,
              }" :minRatings="{
  location: 3.1,
  value: 4.1,
  rooms: 4.4,
  service: 4.0,
  cleanliness: 3.9,
  sleep: 3.9,
}" :showRating="true"></Glyph>
            </div>
            <p>The example above shows a hotel with a particulary high rating in location and sleep quality, but not so
              good service and cleanliness</p>
            <p>
              <v-icon icon="mdi-arrow-left" class="inline"></v-icon> The priorities that you select here
              change the width of the segments and determine the weight that each category has in the comparison.
            </p>
          </v-card-text>
          <v-card-actions>
            <v-btn text @click="interfaceStore.tutorialStep.priorities = false">Ok</v-btn>
          </v-card-actions>
        </v-card>
      </v-overlay>
    </div>
  </v-sheet>
</template>

<style lang="scss" scoped>
.instructions .v-card {
  max-width: 500px;

  & p {
    padding-top: 0.5rem;
    padding-bottom: 0.5rem;
  }
}
</style>