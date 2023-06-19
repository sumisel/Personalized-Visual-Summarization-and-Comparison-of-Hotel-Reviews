<script setup>
import Glyph from "./Glyph.vue";

import { storeToRefs } from "pinia";
import { useCategoryStore } from "../stores/category.js";
const categoryStore = useCategoryStore();
const { categories } = storeToRefs(categoryStore);
</script>

<template>
  <v-sheet class="ma-2 pa-2">
    <div class="my-2">
      <div class="text-h6 mb-4">My Priorities</div>
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
    <v-divider></v-divider>
    <div class="my-8">
      <div class="text-h6 mb-4">My Points of Interest</div>
      <v-autocomplete
        label="Choose your favorites"
        prepend-icon="mdi-map-marker-plus"
        :items="['parks and recreation', 'public transport', 'nightlive', 'restaurants', 'shopping', 'sightseeing']"
      ></v-autocomplete>
      <v-chip closable>restaurants</v-chip>
    </div>
  </v-sheet>
</template>

<style lang="scss" scoped>
</style>