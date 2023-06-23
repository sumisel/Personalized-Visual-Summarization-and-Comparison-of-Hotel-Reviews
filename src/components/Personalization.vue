<script setup>
import Glyph from "./Glyph.vue";

import { storeToRefs } from "pinia";
import { useCategoryStore } from "../stores/category.js";
import { usePoiStore } from "../stores/poi";
import { inject } from "vue";
const categoryStore = useCategoryStore();
const { categories } = storeToRefs(categoryStore);
const poiStore = usePoiStore();
const poiMeta = inject("poiMeta");
</script>

<template>
  <v-sheet class="pa-4">
    <div class="text-h5 my-4">My Preferences</div>
    <div class="my-12">
      <div class="text-h6 mb-4">
        <v-icon>mdi-map-marker-radius</v-icon> Points of Interest
      </div>
      <v-autocomplete
        label="Choose your favorites"
        :items="poiStore.pois"
        v-model="poiStore.selectedPois"
        chips
        closable-chips
        multiple
      >
        <template v-slot:chip="{ props, item }">
          <v-chip
            v-bind="props"
            :prepend-icon="poiMeta[item.raw].icon"
            :text="item.raw"
          ></v-chip>
        </template>
        <template v-slot:item="{ props, item }">
          <v-list-item
            v-bind="props"
            :prepend-icon="poiMeta[item.raw].icon"
            :title="item.raw"
          ></v-list-item>
        </template>
      </v-autocomplete>
    </div>
    <div class="my-12">
      <div class="text-h6 mb-4"><v-icon>mdi-sort</v-icon> Priorities</div>
      <div class="d-flex justify-center">
        <Glyph></Glyph>
        <div>
          <v-icon icon="mdi-information-outline" size="small"></v-icon
          ><v-tooltip activator="parent" location="bottom" max-width="300px"
            >For every hotel, such a pie chart shows the ratings across all
            categories. For comparison, the bright area in the middle indicates
            the mininum rating of a category among the selected hotels. Pie
            slices are scaled according to priorities, as well as the overall
            rating in the center is weighted by these priorities.</v-tooltip
          >
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
          <tr
            v-for="category in categories"
            :key="category.id"
            :class="{ hover: category.hover }"
            @mouseenter="categoryStore.hover(category.id)"
            @mouseleave="categoryStore.unhover()"
          >
            <td>
              <v-icon
                :icon="category.icon"
                class="mr-2"
                :color="category.color"
              ></v-icon
              >{{ category.title }}
            </td>
            <td>
              <v-slider
                :color="category.color"
                v-model="category.value"
                hide-details="true"
                thumb-size="12"
                track-size="2"
                min="0.01"
              ></v-slider>
            </td>
          </tr>
        </tbody>
      </v-table>
    </div>
  </v-sheet>
</template>

<style lang="scss" scoped>
</style>