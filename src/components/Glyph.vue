<script setup>
import * as d3 from "d3";

import { onMounted } from "vue";

import { useCategoryStore } from "../stores/category.js";

onMounted(() => {
  const categoriesStore = useCategoryStore();
  const data = categoriesStore.categories.map((category) => category.value);

  const pie = d3.pie();
  const arc = d3.arc().innerRadius(0).outerRadius(50);

  const width = 100;
  const height = 100;
  const svg = d3
    .select("svg")
    .attr("width", width)
    .attr("height", height)
    .attr("viewBox", [-width / 2, -height / 2, width, height])
    .attr("style", "max-width: 100%; height: auto; height: intrinsic;");

  svg.append("g").selectAll("path").data(pie(data)).join("path").attr("d", arc);
});
</script>

<template>
  <svg></svg>
  <p>{{ categories }}</p>
</template>