<script setup>
import { useCategoryStore } from "../stores/category.js";

const props = defineProps({
  categoryId: String,
});

const category = useCategoryStore().categoriesById[props.categoryId];
</script>

<template>
  <span
    ><v-icon :icon="category.icon" :color="category.color" class="mr-1"></v-icon
    ><b
      ><u :style="`text-decoration-color: ${category.color};`">{{
        categoryId
      }}</u></b
    ></span
  >
</template>

<style scoped>
span {
  white-space: nowrap;
}
u {
  text-decoration-thickness: 0.15rem;
}
</style>