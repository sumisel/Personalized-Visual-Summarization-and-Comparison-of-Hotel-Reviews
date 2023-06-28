<script setup>
import { maxIndex } from "d3";
const props = defineProps({
  index: Number,
  listLength: Number,
});
</script>

<template>
  <span v-if="index > 0 && index < listLength - 1">, </span>
  <span v-else-if="index === listLength - 1 && listLength > 2">, and </span>
  <span v-else-if="index === 1 && listLength === 2"> and </span>
  <slot></slot>
</template>;
