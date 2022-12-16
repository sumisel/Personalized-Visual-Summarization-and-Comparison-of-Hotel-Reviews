<script setup>
import * as d3 from "d3";

import { onMounted } from "vue";

import { useCategoryStore } from "../stores/category.js";

onMounted(() => {
  const categoriesStore = useCategoryStore();

  const arcs = d3.pie().value((d) => d.value)(categoriesStore.categories);
  console.log(arcs);
  const arc = d3.arc().innerRadius(0).outerRadius(50);

  const width = 100;
  const height = 100;
  const svg = d3
    .select("svg")
    .attr("width", width)
    .attr("height", height)
    .attr("viewBox", [-width / 2, -height / 2, width, height])
    .attr("style", "max-width: 100%; height: auto; height: intrinsic;");

  svg
    .append("g")
    .selectAll("path")
    .data(arcs)
    .join("path")
    .attr("fill", (d) => d.data.color)
    .attr("d", arc);
});
</script>

<template>
  <svg></svg>
</template>