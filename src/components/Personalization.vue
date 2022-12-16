<script setup>
import Glyph from "./Glyph.vue";

import { storeToRefs } from "pinia";
import { useCategoryStore } from "../stores/category.js";
const { categories } = storeToRefs(useCategoryStore());
</script>

<template>
  <v-sheet class="ma-2 pa-2 rounded">
    <div class="my-2">
      <div class="text-h6">My Priorities</div>
      <Glyph></Glyph>
      <v-table density="compact">
        <thead>
          <tr>
            <th class="text-left">Category</th>
            <th class="text-left w-50">Priority</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="category in categories" :key="category.id">
            <td><v-icon :icon="category.icon" class="mr-2"></v-icon>{{ category.title }}</td>
            <td>
              <v-slider
                :model-value="category.value"
                hide-details="true"
                thumb-size="12"
                track-size="2"
              ></v-slider>
            </td>
          </tr>
        </tbody>
      </v-table>
    </div>
    <v-divider></v-divider>
    <div class="my-2">
      <div class="text-h6">My Keywords</div>
      <v-autocomplete
        label="Add keyword"
        prepend-icon="mdi-tag-plus"
        :items="[
          'wifi',
          'shower',
          'breakfast',
          'public transport',
          'parking',
          'walking',
        ]"
      ></v-autocomplete>
      <v-chip closable>pool</v-chip>
      <v-chip closable>drinks</v-chip>
    </div>
    <v-divider></v-divider>
    <div class="my-2">
      <div class="text-h6">My Points of Interest</div>
      <v-autocomplete
        label="Add location"
        prepend-icon="mdi-map-marker-plus"
        :items="['downtwon', 'cathedral', 'woods', 'Eiffel Tower', 'Louvre']"
      ></v-autocomplete>
      <v-chip closable>beach</v-chip>
    </div>
  </v-sheet>
</template>

<style scoped>
</style>