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
        cleanliness: 5.0,
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
        cleanliness: 3.0,
        sleep: 3.0,
      },
    },
  },
  setup() {
    const svg = ref();
    const categoryStore = useCategoryStore();

    return {
      svg,
      categoryStore,
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

    this.categoryStore.$subscribe(() => {
      this.plot();
    });

    this.plot();
  },
  methods: {
    plot() {
      const data = this.categoryStore.categories.map((category, i) => {
        const d = {};
        d.category = category;
        d.ratings = this.ratings[category.id];
        d.minRatings = this.minRatings[category.id];
        return d;
      });
      const arcs = d3
        .pie()
        .sort(null)
        .value((d) => d.category.value)(data);
      const arc = d3
        .arc()
        .innerRadius(0)
        .outerRadius((d) => d.data.ratings * 10);
      const arcMin = d3
        .arc()
        .innerRadius(0)
        .outerRadius((d) => d.data.minRatings * 10);
      const overallRating = [
        Object.keys(this.ratings).reduce(
          (sum, categoryId) =>
            (sum +=
              this.ratings[categoryId] *
              this.categoryStore.normalizedCategoryValues[categoryId]),
          0
        ),
      ];
      const noCategoryHovered = this.categoryStore.noCategoryHovered;

      d3.select(this.svg)
        .selectAll("path.ratings")
        .data(arcs)
        .join("path")
        .classed("ratings", true)
        .attr("fill", (d) => d.data.category.color)
        .attr("fill-opacity", (d) =>
          d.data.category.hover || noCategoryHovered ? "1" : "0.2"
        )
        .attr("d", arc)
        .on("mouseover", (event, d) => {
          this.categoryStore.hover(d.data.category.id);
        })
        .on("mouseout", () => {
          this.categoryStore.unhover();
        });

      d3.select(this.svg)
        .selectAll("path.min-ratings")
        .data(arcs)
        .join("path")
        .classed("min-ratings", true)
        .attr("fill", "#FFF")
        .attr("fill-opacity", "0.85")
        .attr("d", arcMin)
        .on("mouseover", (event, d) => {
          this.categoryStore.hover(d.data.category.id);
        })
        .on("mouseout", () => {
          this.categoryStore.unhover();
        });

      d3.select(this.svg)
        .selectAll("text")
        .data(overallRating)
        .join("text")
        .attr("text-anchor", "middle")
        .attr("dy", 8)
        .attr("font-size", "1.5rem")
        .text((d) => d.toFixed(1));
    },
  },
};
</script>

<template>
  <svg ref="svg"></svg>
</template>