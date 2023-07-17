<script>
import * as d3 from "d3";

import { ref, onMounted, watch } from "vue";

import { useHotelStore } from "../stores/hotel.js";
import { useCategoryStore } from "../stores/category.js";
import { useTimeStore } from "../stores/ratings_over_time";
import {el} from "vuetify/locale";

export default {
  props: {
    categoryId: {
      type: String,
      default: "categoryId",
    },
    hotelId: {
      type: String,
      default: "hotelId",
    },
    color: {
      type: String,
      default: "#000000",
    },
    width: {
      type: Number,
      default: 100,
    },
    height: {
      type: Number,
      default: 100,
    },
    yMin: {
      type: Number,
      default: 1,
    },
    yMax: {
      type: Number,
      default: 5,
    },
  },
  setup() {
    const svg = ref();
    const hotelStore = useHotelStore();
    const categoryStore = useCategoryStore();
    const timeStore = useTimeStore();

    return {
      svg,
      hotelStore,
      categoryStore,
      timeStore,
    };
  },
  mounted() {
    d3.select(this.svg)
      .attr("width", this.width)
      .attr("height", this.height)
      .attr("style", "max-width: 100%; height: intrinsic;");

    watch(
      () => this.categoryStore.relevantCategories,
      () => {
        this.plot();
      }
    );

    this.plot();
  },
  methods: {
    plot_line(data, svg, x_min, x_max) {
      // add x axis in date format
      const x = d3
        .scaleLinear()
        .domain(
          d3.extent([x_min, x_max], function (d) {
            return d;
          })
        )
        .range([0, this.width]);
      svg
        .append("g")
        .attr("transform", "translate(0," + this.height + ")")
        .call(d3.axisBottom(x).ticks(5));

      // add y axis
      const y = d3
        .scaleLinear()
        .domain([this.yMin, this.yMax])
        .range([this.height, 0]);
      svg.append("g").call(d3.axisLeft(y));

      // color palette
      const res = this.categoryStore.relevantCategories.map((c) => c.id);
      const color = d3
        .scaleOrdinal()
        .domain(res)
        .range(res.map((d) => this.categoryStore.categoriesById[d].color));

      // draw the lines
      console.log(data)
      svg
        .append("path")
        .datum(data)
        .attr("fill", "none")
        .attr("stroke", "darkgrey")
        .attr("stroke-width", 2.0)
        .attr("d", d3.line()
            .x(function(d) { return x(+d.timestamp) })
            .y(function(d) { return y(+d.value) })
        );
    },
    plot() {
      // remove all previous elements
      d3.select(this.svg).selectAll("*").remove();
      const svg = d3.select(this.svg).append("g");

      // draw line chart
      const d = this.timeStore.dataById[this.hotelId];
      if (d == undefined) {
        return;
      }

      // x min is today as epoch timestamp
      var x_min = Math.floor(Date.now());
      var x_max = 0;
      // compute values for each category
      const data = [];
      for (const [timestamp, values] of Object.entries(d)) {
        x_min = Math.min(x_min, +timestamp);
        x_max = Math.max(x_max, +timestamp);

        const weighted_values = [];
        let valueSum = 0;
        for (const [category, v] of Object.entries(values)) {
          if (
              this.categoryStore.relevantCategories
                  .map((c) => c.id)
                  .includes(category)
              &&
              v["average"] != 0) {
                weighted_values.push(v["average"] * this.categoryStore.categoriesById[category]["value"]);
                valueSum += this.categoryStore.categoriesById[category]["value"];
          }
        }
        if (weighted_values.length > 0) {
          let weighted_average = weighted_values.reduce((a, b) => a + b, 0);
              weighted_average /= (valueSum);
          data.push({
            name: "average",
            timestamp: +timestamp,
            value: weighted_average,
            values: weighted_values,
          });
        }

      }
      x_min = x_min + (x_max - x_min) / 4.0; // cut off early dates
      this.plot_line(data, svg, x_min, x_max);
    },
  },
};
</script>

<style>
.y-axis {
  size: 2px;
}
.tick line {
  visibility: hidden;
}
</style>

<template>
  <svg
    ref="svg"
    :id="'chart_trending_' + this.categoryId + '_' + this.hotelId"
  ></svg>
</template>