<script>
import * as d3 from "d3";

import { ref, onMounted } from "vue";

import { useCategoryStore } from "../stores/category.js";
export default {
  props: {
    ratings: {
      type: Object,
      default: {
        location: 5.0,
        value: 5.0,
        rooms: 5.0,
        service: 5.0,
        clean: 5.0,
        sleep: 5.0,
      },
    },
    minRatings: {
      type: Object,
      default: {
        location: 3.0,
        value: 3.0,
        rooms: 3.0,
        service: 3.0,
        clean: 3.0,
        sleep: 3.0,
      },
    },
  },
  setup() {
    const svg = ref();
    const categoriesStore = useCategoryStore();

    return {
      svg,
      categoriesStore,
    };
  },
  mounted() {
    const width = 100;
    const height = 100;
    d3.select(this.svg)
      .attr("width", width)
      .attr("height", height)
      .attr("viewBox", [-width / 2, -height / 2, width, height])
      .attr("style", "max-width: 100%; height: auto; height: intrinsic;");

    // this.categoriesStore.$subscribe(() => {
    //   //this.plot();
    // });

    this.plot();
  },
  methods: {
    plot() {
      const data = this.categoriesStore.categories.map((category, i) => {
        category.rating = this.ratings[category.id];
        category.minRating = this.minRatings[category.id];
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

      d3.select(this.svg)
        .selectAll("path.ratings")
        .data(arcs)
        .join("path")
        .attr("class", "ratings")
        .attr("fill", (d) => d.data.color)
        .attr("d", arc);

      d3.select(this.svg)
        .selectAll("path.min-ratings")
        .data(arcs)
        .join("path")
        .attr("class", "min-ratings")
        .attr("fill", "#FFF")
        .attr("fill-opacity", "0.85")
        .attr("d", arcMin);
    },
  },
};
</script>


<template>
  <svg ref="svg"></svg>
</template>