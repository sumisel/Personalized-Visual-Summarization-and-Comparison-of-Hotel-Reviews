<script>
import * as d3 from "d3";

import { ref, onMounted } from "vue";

import { useCategoryStore } from "../stores/category.js";
export default {
  props: {
    ratings: Object,
  },
  setup() {
    const svg = ref();
    const categoriesStore = useCategoryStore();

    const minRatings = {
      location: 3.5,
      value: 4.1,
      room: 3.2,
      service: 3.8,
      clean: 4.0,
      sleep: 4.8,
    };

    return {
      svg,
      categoriesStore,
      minRatings,
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
      const ratings = this.ratings
        ? this.ratings
        : {
            location: 5.0,
            value: 5.0,
            room: 5.0,
            service: 5.0,
            clean: 5.0,
            sleep: 5.0,
          };
      console.log(ratings.location);
      const data = this.categoriesStore.categories.map((category, i) => {
        category.rating = ratings[category.id];
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