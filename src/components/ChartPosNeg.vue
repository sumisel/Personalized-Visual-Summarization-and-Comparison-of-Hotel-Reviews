<script>
import * as d3 from "d3";

import { ref, onMounted } from "vue";

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
      default: 100,
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

    return {
      svg,
      hotelStore,
    };
  },
  mounted() {
    d3.select(this.svg)
      .attr("width", this.width)
      .attr("height", this.height)
      .attr("style", "max-width: 100%; height: auto; height: intrinsic;");

    //WARNING if all individual reviews are loaded into the hotel data, this makes the site very slow
    this.hotelStore.$subscribe(() => {
      this.plot();
    });

    this.plot();
  },
  methods: {
    plot() {
      // get values for each hotel
      const data = this.posNeg;

      // remove all previous elements
      d3.select(this.svg).selectAll("*").remove();
      const svg = d3.select(this.svg).append("g");

      // x axis
      const x = d3.scaleLinear()
          .domain([this.xMin, this.xMax])
          .range([ 0, this.width]);
      /*svg.append("g")
          .attr("transform", "translate(0," + this.height + ")")
          .call(d3.axisBottom(x))
          .selectAll("text")
          .attr("transform", "translate(-10,0)rotate(-45)")
          .style("text-anchor", "end");
       */

      // y axis
      const y = d3.scaleBand()
          .domain(data.map(function(d) { return d.name; }))
          .range([ 0, this.height ])
          .padding(.1);

      // bars
      svg.selectAll("myRect")
          .data(data)
          .enter()
          .append("rect")
          .attr("x", function(d) { return x(-d.negCount); })
          .attr("y", function(d) { return y(d.name); })
          .attr("width", function(d) { return x(d.posCount)-x(-d.negCount); })
          .attr("height", y.bandwidth() )
          .attr("fill", this.color)

      // add the y Axis on top of the bars
      svg.append("g")
          .attr("transform", "translate(" + x(0) + ",0)")
          .call(d3.axisLeft(y)
              .tickSizeOuter(0))
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
  <svg ref="svg" :id="this.categoryId+'_'+this.hotelId"></svg>
</template>