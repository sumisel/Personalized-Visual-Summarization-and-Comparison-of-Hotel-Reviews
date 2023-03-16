<script>
import * as d3 from "d3";

import { ref, onMounted } from "vue";

import { useHotelStore } from "../stores/hotel.js";
import { useCategoryStore } from "../stores/category.js";
export default {
  props: {
    categoryPosNeg: {
      type: Object,
      default: {},
    },
    categoryId: {
      type: String,
      default: "categoryId",
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
  },
  setup() {
    const svg = ref();
    const hotelStore = useHotelStore();

    return {
      svg,
      hotelStore,
    };
  },
  mounted() {
    d3.select(this.svg)
      .attr("width", this.width)
      .attr("height", this.height)
      .attr("viewBox", [-this.width / 2, -this.height / 2, this.width, this.height])
      .attr("style", "max-width: 100%; height: auto; height: intrinsic;");

    this.hotelStore.$subscribe(() => {
      this.plot();
    });

    this.plot();
  },
  methods: {
    plot() {
      // get values for each hotel
      const sentiments = this.hotelStore.categoryPosNeg(this.categoryId)
      const data = Object.keys(sentiments).map((hotel) => {
        const d = {};
        d.name = hotel;
        d.posCount = sentiments[hotel].pos_counts_category;
        d.negCount = sentiments[hotel].neg_counts_category;
        return d;
      });

      const svg = d3.select(this.svg);

      console.log(this.width)
      console.log(this.height)

      // x axis
      const x = d3.scaleLinear()
          .domain([-5, 30])
          .range([ 0, this.width]);
      svg.append("g")
          .attr("transform", "translate(0," + this.height + ")")
          .call(d3.axisBottom(x))
          .selectAll("text")
          .attr("transform", "translate(-10,0)rotate(-45)")
          .style("text-anchor", "end");

      // y axis
      var y = d3.scaleBand()
          .range([ 0, this.height ])
          .domain(data.map(function(d) { return d.name; }))
          .padding(.1);

      // bars
      svg.selectAll("myRect")
          .data(data)
          .enter()
          .append("rect")
          .attr("x", function(d) { return x(-d.negCount); })
          .attr("y", function(d) { return y(d.name); })
          .attr("width", function(d) { return x(d.posCount); })
          .attr("height", y.bandwidth() )
          .attr("fill", this.color)

      // add the y Axis on top of the bars
      svg.append("g")
          .call(d3.axisLeft(y))
          .selectAll("text").remove()

    },
  },
};
</script>

<style>
  .y-axis{
    size: 2px;
  }
  .tick line{
    visibility:hidden;
  }
</style>

<template>
  <svg ref="svg"></svg>
</template>