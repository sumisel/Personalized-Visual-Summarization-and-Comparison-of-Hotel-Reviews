<script>
import * as d3 from "d3";

import { ref, watch } from "vue";

import { useHotelStore } from "../stores/hotel.js";
import { useCategoryStore } from "../stores/category.js";
import { useTimeStore } from "../stores/ratings_over_time";

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
    plot() {
      // remove all previous elements
      d3.select(this.svg).selectAll("*").remove();
      const svg = d3.select(this.svg).append("g");
      svg.attr("transform", "translate(20, 5)");

      // draw line chart
      const d = this.timeStore.compileCategoryData(this.hotelId, this.categoryId);
      const x_min = d["x_min"];
      const x_max = d["x_max"];
      const data = d["data"];

      // add x axis in date format
      const x = d3
          .scaleLinear()
          .domain(
              d3.extent([x_min, x_max], function (d) {
                return d;
              })
          )
          .range([0, this.width-20]);
      svg
          .append("g")
          .attr("transform", "translate(0," + (this.height-5) + ")")
          .call(d3.axisBottom(x).ticks(5));

      // add y axis
      const y = d3
          .scaleLinear()
          .domain([this.yMin, this.yMax])
          .range([this.height-5, 0]);
      svg.append("g").call(d3.axisLeft(y).tickValues([3, 4, 5]).tickFormat(d3.format("d")));
      // set a fading gradient for the axis
      svg.append("linearGradient")
          .attr("id", "line-gradient")
          .attr("gradientUnits", "userSpaceOnUse")
          .attr("x1", 0)
          .attr("y1", y(this.yMin))
          .attr("x2", 0)
          .attr("y2", y(this.yMax))
          .selectAll("stop")
          .data([
            {offset: "0%", color: "white"},
            {offset: "60%", color: "black"}
          ])
          .enter().append("stop")
          .attr("offset", function(d) { return d.offset; })
          .attr("stop-color", function(d) { return d.color; });
      svg.selectAll(".domain").style("stroke", "url(#line-gradient)")


      // color palette
      const res = this.categoryStore.relevantCategories.map((c) => c.id);
      const color = d3
          .scaleOrdinal()
          .domain(res)
          .range(res.map((d) => this.categoryStore.categoriesById[d].color));

      // draw the line
      svg
          .append("path")
          .datum(data)
          .attr("fill", "none")
          .attr("stroke", this.color)
          .attr("stroke-width", 2.0)
          .attr("d", d3.line()
              .x(function(d) { return x(+d["timestamp"]) })
              .y(function(d) { return y(+d["value"]) })
          );

      // draw regression line
      const regression = this.timeStore.regression(data, x_min, x_max);
      //console.log(regression);
      svg
          .append("path")
          .datum(regression)
          .attr("stroke", "black")
          .attr("stroke-width", 1.0)
          .attr("d", d3.line()
              .x(function(d) { return x(d[0]) })
              .y(function(d) { return y(d[1]) })
          );
    },
  },
};
</script>

<style>
.y-axis {
  size: 2px;
}
</style>

<template>
  <svg
    ref="svg"
    :id="'chart_trending_' + this.categoryId + '_' + this.hotelId"
  ></svg>
</template>