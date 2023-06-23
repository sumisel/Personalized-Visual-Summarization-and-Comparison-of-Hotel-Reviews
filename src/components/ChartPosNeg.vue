<script>
import * as d3 from "d3";

import { ref, onMounted, watch, computed, inject } from "vue";

import { useHotelStore } from "../stores/hotel.js";
import { useCategoryStore } from "../stores/category.js";

export default {
  props: {
    posNeg: {
      type: Object,
      default: {},
    },
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
      default: 200,
    },
    height: {
      type: Number,
      default: 100,
    },
    xMin: {
      type: Number,
      default: -30,
    },
    xMax: {
      type: Number,
      default: 30,
    },
  },
  setup() {
    const svg = ref();
    const hotelStore = useHotelStore();
    const categoryStore = useCategoryStore();
    const emitter = inject("emitter");

    return {
      svg,
      hotelStore,
      categoryStore,
      emitter,
    };
  },
  mounted() {
    d3.select(this.svg)
      .attr("width", this.width)
      .attr("height", this.height)
      .attr("style", "max-width: 100%; height: auto; height: intrinsic;");

    watch(
      () => this.hotelStore.selectedHotelIds,
      () => {
        console.log("ChartPosNeg selected hotels changed");
        this.plot();
      }
    );
    watch(
      () => this.categoryStore.relevantCategories,
      () => {
        console.log("ChartPosNeg relevant categories changed");
        this.plot();
      }
    );

    this.plot();

    this.emitter.on(
      "highlight_" + this.categoryId + "_" + this.hotelId.replaceAll(".", "_"),
      (params) => {
        console.log("chart receive highlight");
        this.highlight(
          params["svgId"],
          params["categoryId"],
          params["hotelId"],
          params["num_items"],
          params["polarity"]
        );
      }
    );
    this.emitter.on(
      "unhighlight_" +
        this.categoryId +
        "_" +
        this.hotelId.replaceAll(".", "_"),
      (params) => {
        this.unhighlight(params["categoryId"], params["hotelId"]);
      }
    );
  },
  methods: {
    plot() {
      // get values for each hotel
      const data = this.posNeg;
      console.log("chart ", this.categoryId);
      console.log("chart ", data);

      // remove all previous elements
      d3.select(this.svg).selectAll("*").remove();
      const svg = d3.select(this.svg).append("g");

      // x axis
      const x = d3
        .scaleLinear()
        .domain([this.xMin, this.xMax])
        .range([0, this.width]);
      /*svg.append("g")
          .attr("transform", "translate(0," + this.height + ")")
          .call(d3.axisBottom(x))
          .selectAll("text")
          .attr("transform", "translate(-10,0)rotate(-45)")
          .style("text-anchor", "end");
       */

      // y axis
      const y = d3
        .scaleBand()
        .domain(
          data.map(function (d) {
            return d.name;
          })
        )
        .range([0, this.height])
        .padding(0.1);

      // bars
      svg
        .selectAll("myRect")
        .data(data)
        .enter()
        .append("rect")
        .attr("y", function (d) {
          return y(d["name"]);
        })
        .attr("x", function (d) {
          return x(-d["negCount"]);
        })
        .attr("width", function (d) {
          return x(d["posCount"]) - x(-d["negCount"]);
        })
        .attr("height", y.bandwidth())
        .attr("fill", this.color);

      // add the y Axis on top of the bars
      svg
        .append("g")
        .attr("transform", "translate(" + (x(0) - 0.5) + ",0)")
        .call(d3.axisLeft(y).tickSizeOuter(0))
        .selectAll("path")
        .attr("stroke-width", "2px");
      svg.selectAll("text").remove();
    },

    highlight(svgId, categoryId, hotelId, num_items, polarity) {
      const svg = d3.select(
        "#" + categoryId + "_" + hotelId.replaceAll(".", "_")
      );

      // x axis
      let xScale = 1;
      if (categoryId == "overall") xScale = 1;
      const x = d3
        .scaleLinear()
        .domain([-xScale, xScale])
        .range([0, svg.attr("width")]);
      // y axis
      const y = d3
        .scaleBand()
        .domain([hotelId])
        .range([0, svg.attr("height")])
        .padding(0.1);

      const xValue =
        num_items / this.hotelStore.hotelById(hotelId)["review_count"];

      // bars
      if (polarity == "neg") {
        svg
          .select("g")
          .append("rect")
          .attr("class", "highlight")
          .attr("y", y(hotelId))
          .attr("x", x(-xValue))
          .attr("width", x(0) - x(-xValue))
          .attr("height", y.bandwidth())
          .attr("fill", "black")
          .attr("stroke-width", "1px")
          .attr("stroke", "white");
      } else {
        svg
          .select("g")
          .append("rect")
          .attr("class", "highlight")
          .attr("y", y(hotelId))
          .attr("x", x(0))
          .attr("width", x(xValue) - x(0))
          .attr("height", y.bandwidth())
          .attr("fill", "black")
          .attr("stroke-width", "1px")
          .attr("stroke", "white");
      }
    },

    unhighlight(categoryId, hotelId) {
      d3.select("#" + categoryId + "_" + hotelId.replaceAll(".", "_"))
        .selectAll(".highlight")
        .remove();
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
    :id="this.categoryId + '_' + this.hotelId.replaceAll('.', '_')"
  ></svg>
</template>