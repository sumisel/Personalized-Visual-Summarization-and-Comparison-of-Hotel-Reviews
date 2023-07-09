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
        :open-on-click="false" location="start top" offset="20" persistent>
        <v-card class="pa-2">
          <v-card-text>Here, you can select what's your preferences regarding the location.</v-card-text>
          <v-card-actions>
            <v-btn text
              @click="interfaceStore.tutorialStep.poi = false; interfaceStore.tutorialStep.priorities = true">Ok</v-btn>
          </v-card-actions>
        </v-card>
      </v-overlay>
    </div>
    <div class="my-12">
      <div class="text-h6 mb-4"><v-icon>mdi-sort</v-icon> Priorities</div>
      <div class="d-flex justify-center">
        <Glyph></Glyph>
        <div>
          <v-icon icon="mdi-information-outline" size="small"></v-icon><v-tooltip activator="parent" location="bottom"
            max-width="300px">For every hotel, such a pie chart shows the ratings across all
            categories. For comparison, the bright area in the middle indicates
            the mininum rating of a category among the selected hotels. Pie
            slices are scaled according to priorities, as well as the overall
            rating in the center is weighted by these priorities.</v-tooltip>
        </div>
      </div>
      <v-table density="compact">
        <thead>
          <tr>
            <th class="text-left">Category</th>
            <th class="text-left w-50">Priority</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="category in categories" :key="category.id" :class="{ hover: category.hover }"
            @mouseenter="categoryStore.hover(category.id)" @mouseleave="categoryStore.unhover()">
            <td>
              <v-icon :icon="category.icon" class="mr-2" :color="category.color"></v-icon>{{ category.title }}
            </td>
            <td>
              <v-slider :color="category.color" v-model="category.value" hide-details="true" thumb-size="12"
                track-size="2" min="0.01"></v-slider>
            </td>
          </tr>
        </tbody>
      </v-table>
      <v-overlay activator="parent" v-model="interfaceStore.tutorialStep.priorities" location-strategy="connected"
        :open-on-click="false" location="start top" offset="20" persistent>
        <v-card class="pa-2">
          <v-card-text>And, these are priorities that should be considered for evaluating customer ratings</v-card-text>
          <v-card-actions>
            <v-btn text
              @click="interfaceStore.tutorialStep.priorities = false">Ok</v-btn>
          </v-card-actions>
        </v-card>
      </v-overlay>
    </div>
  </v-sheet>
</template>

<style lang="scss" scoped></style>