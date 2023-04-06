<script>
import * as d3 from "d3";

import {ref, onMounted, watch} from "vue";

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

    if(this.categoryId == "line"){
      watch(() => this.categoryStore.relevantCategories, () => {
        console.log('ChartTrending categories changed');
        this.plot();
      });
    }

    this.plot();
  },
  methods: {
    plot_line(data, svg, x_min, x_max) {
      // add x axis in date format
      const x = d3.scaleLinear()
          .domain(d3.extent([x_min, x_max], function(d) { return d; }))
          .range([ 0, this.width ]);
      svg.append("g")
          .attr("transform", "translate(0," + this.height + ")")
          .call(d3.axisBottom(x).ticks(5));

      // add y axis
      const y = d3.scaleLinear()
          .domain([this.yMin, this.yMax])
          .range([ this.height, 0 ]);
      svg.append("g")
          .call(d3.axisLeft(y));

      // color palette
      const res = this.categoryStore.relevantCategories.map((c) => c.id);
      const color = d3.scaleOrdinal()
          .domain(res)
          .range(res.map((d) => this.categoryStore.categoriesById[d].color))

      // draw the lines
      svg.selectAll(".line")
          .data(data)
          .enter()
          .append("path")
          .attr("fill", "none")
          .attr("stroke", function(d,i){ return color(d.name) })
          .attr("stroke-width", 1.0)
          .attr("d", function(d){
            return d3.line()
                .x(function(e) { return x(e.timestamp); })
                .y(function(e) { return y(+e.value); })
                (d.values)
          })
    },
    plot_bars(data, svg) {
      console.log(data)

      // add x axis
      const x = d3.scaleBand()
          .domain(data["values"].map(function(d) { return +d.timestamp; }))
          .range([ 0, this.width ])
          .padding(.05);
      svg.append("g")
          .attr("transform", "translate(0," + this.height + ")")
          .call(d3.axisBottom(x).ticks(5));

      // add y axis
      const y = d3.scaleLinear()
          .domain([this.yMin-.5, this.yMax+.5])
          .range([ this.height, 0 ]);
      svg.append("g")
          .call(d3.axisLeft(y));

      // bars
      const h = this.height;
      svg.selectAll("myRect")
          .data(data["values"])
          .enter()
          .append("rect")
            .attr("x", function(d) { return x(+d.timestamp); })
            .attr("y", function(d) { return y(+d.upper); })
            .attr("width", x.bandwidth())
            .attr("height", function(d) { return -y(+d.upper)+y(+d.lower); })
            .attr("fill", this.color)
      // outlier points
      svg.selectAll("myCircle")
          .data(data["outliers"])
          .enter()
          .append("circle")
            .attr("cx", function(d) { return x(+d.timestamp)+.5*x.bandwidth(); })
            .attr("cy", function(d) { return y(+d.value); })
            .attr("r", "1")
            .style("fill", this.color)
            .attr("stroke", this.color)

    },
    plot() {
      // remove all previous elements
      d3.select(this.svg).selectAll("*").remove();
      const svg = d3.select(this.svg).append("g");


      // draw multi line chart
      if(this.categoryId == "line"){
        const d = this.timeStore.dataById[this.hotelId];
        if(d == undefined) {
          return;
        }

        // x min is today as epoch timestamp
        var x_min = Math.floor(Date.now());
        var x_max = 0;
        // compute values for each category
        const data = [];
        for (const [category, values] of Object.entries(d)) {
          if(!this.categoryStore.relevantCategories.map((c) => c.id).includes(category)) {
            continue;
          }
          const vs = []
          for (const [timestamp, v] of Object.entries(values)) {
            if(v["average"]!=0) {
              x_min = Math.min(x_min, +timestamp);
              x_max = Math.max(x_max, +timestamp);
              vs.push({
                "timestamp": timestamp,
                "value": v["average"],
              });
            }
          }
          data.push({
            "name": category,
            "values": vs,
          });
        }
        x_min = x_min+(x_max-x_min)/4.0;
        this.plot_line(data, svg, x_min, x_max)
      } else { // draw bar chart with outliers
        const d = this.timeStore.dataById[this.hotelId][this.categoryId];

        const values = [];
        const outliers = [];
        for (const [timestamp, v] of Object.entries(d)) {
          if(v["average"]!=0) {
            values.push({
              "timestamp": timestamp,
              "upper": v["q3"],
              "lower": v["q1"],
            });
            const os = v["outliers"].map(function(o) {return {"timestamp": timestamp, "value": o}})
            for (const o of os) {
              outliers.push(o);
            }
          }
        }
        this.plot_bars({"values":values, "outliers":outliers}, svg)
      }
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
  <svg ref="svg" :id="'chart_trending_'+this.categoryId+'_'+this.hotelId"></svg>
</template>