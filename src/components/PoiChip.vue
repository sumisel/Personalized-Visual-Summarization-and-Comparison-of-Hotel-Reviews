<script setup>
import { defineProps, inject } from "vue";

const poiMeta = inject("poiMeta");

const props = defineProps({
  poi: String,
});
</script>

<template>
  <v-chip
    :style="{
      backgroundColor: poiMeta[poi].color,
    }"
    ><v-icon start :icon="poiMeta[poi].icon"></v-icon> {{ poi }}</v-chip
  >
</template>