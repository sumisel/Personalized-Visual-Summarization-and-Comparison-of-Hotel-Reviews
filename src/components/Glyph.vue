<script setup>
import * as d3 from "d3";

import { ref, onMounted } from "vue";

import { useCategoryStore } from "../stores/category.js";

const svg = ref();

const categoriesStore = useCategoryStore();
categoriesStore.$subscribe(() => {
  plot();
});

const ratings = [4.0, 3.5, 2.9, 4.1, 4.3, 4.7];
const minRatings = [3.5, 3.5, 2.9, 3.1, 3.7, 4.2];

onMounted(() => {
  const width = 100;
  const height = 100;
  d3.select(svg.value)
    .attr("width", width)
    .attr("height", height)
    .attr("viewBox", [-width / 2, -height / 2, width, height])
    .attr("style", "max-width: 100%; height: auto; height: intrinsic;");

  plot();
});

const plot = function () {
  const data = categoriesStore.categories.map((category, i) => {
    category.rating = ratings[i];
    category.minRating = minRatings[i];
    return category;
  });
  const arcs = d3
    .pie()
    .sort(null)
    .value((d) => d.value)(data);
  const arc = d3
    .arc()
    .innerRadius(0)
    .outerRadius((d) => d.data.rating * 10);
  const arcMin = d3
    .arc()
    .innerRadius(0)
    .outerRadius((d) => d.data.minRating * 10);

  d3.select(svg.value)
    .selectAll("path.ratings")
    .data(arcs)
    .join("path")
    .attr("class", "ratings")
    .attr("fill", (d) => d.data.color)
    .attr("d", arc);

  d3.select(svg.value)
    .selectAll("path.min-ratings")
    .data(arcs)
    .join("path")
    .attr("class", "min-ratings")
    .attr("fill", "#FFF")
    .attr("fill-opacity", "0.7")
    .attr("d", arcMin);
};
</script>

<template>
  <svg ref="svg"></svg>
</template>