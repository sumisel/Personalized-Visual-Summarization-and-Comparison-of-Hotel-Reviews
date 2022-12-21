<script setup>
import { useCategoryStore } from "../stores/category.js";

const props = defineProps({
  categoryId: String,
});

const categoryStore = useCategoryStore();
const category = categoryStore.categoriesById[props.categoryId];
</script>

<template>
  <span
    @mouseenter="categoryStore.hover(props.categoryId)"
    @mouseleave="categoryStore.unhover()"
    :class="{ hover: category.hover }"
    ><v-icon :icon="category.icon" :color="category.color" class="mr-1"></v-icon
    ><b
      ><u :style="`text-decoration-color: ${category.color};`">{{
        categoryId
      }}</u></b
    ></span
  >
</template>

<style lang="scss" scoped>
span {
  white-space: nowrap;

  & u {
    text-decoration-thickness: 0.15rem;
  }
}
</style>