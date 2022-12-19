<script>
import { useCategoryStore } from "../stores/category.js";

export default {
  props: {
    categoryId: String,
  },
  computed: {
    category() {
      return this.categoryStore.categoriesById[this.categoryId];
    },
  },
  setup() {
    const categoryStore = useCategoryStore();
    return { categoryStore };
  },
};
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
u {
    text-decoration-thickness: 0.15rem; 
}
</style>