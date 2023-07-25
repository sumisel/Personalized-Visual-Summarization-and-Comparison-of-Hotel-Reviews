<script>
import * as d3 from "d3";

import { ref, onMounted, watch } from "vue";

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
    this.plot();
  },
  methods: {
    plot() {
      // remove all previous elements
      d3.select(this.svg).selectAll("*").remove();
      const svg = d3.select(this.svg).append("g");
      svg.attr("transform", "translate(20, 5)");

      // draw bar chart with outliers
      const d = this.timeStore.compileCategoryData(this.hotelId, this.categoryId);
      const x_min = d["x_min"];
      const x_max = d["x_max"];
      const data = d["data"];
      const yMax = d3.max(data, function (d) { return +d["num_entries"]; });

      // add x axis
      const domain = data.map(function (d) {
        return +d.timestamp;
      })
      const delta = domain[1] - domain[0];
      for(let i = x_min; i <= x_max; i+=delta) {
        if(!domain.includes(i)) {
          data.push({
            timestamp: i,
            num_entries: 0
          })
        }
      }
      // add x axis in date format
      const x = d3
          .scaleLinear()
          .domain(
              d3.extent([x_min, x_max], function (d) {
                return d;
              })
          )
          .range([0, this.width-20]);
      const bandwidth = (x(x_max) - x(x_min)) / ((x_max-x_min)/(31 * 24 * 60 * 60 * 1000));
      svg
          .append("g")
          .attr("transform", "translate(0," + (this.height-5) + ")")
          .call(d3.axisBottom(x).ticks(5));

      // add y axis
      const y = d3
          .scaleLinear()
          .domain([this.yMin - 0.5, yMax + 0.5])
          .range([this.height-5, 0]);
      svg.append("g").call(d3.axisLeft(y).ticks(4));

      // bars
      svg
          .selectAll("myRect")
          .data(data)
          .enter()
          .append("rect")
          .attr("x", function (d) {
            return x(+d["timestamp"]);
          })
          .attr("y", function (d) {
            return y(+d["num_entries"]);
          })
          .attr("width", function (d) {
            return bandwidth;
          })
          .attr("height", function (d) {
            return -y(+d["num_entries"]) + y(0);
          })
          .attr("fill", this.color);
    }
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