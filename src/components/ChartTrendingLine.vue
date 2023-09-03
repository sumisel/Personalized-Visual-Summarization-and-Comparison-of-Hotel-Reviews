<script>
import * as d3 from "d3";

import { ref, watch } from "vue";
import { inject } from "vue";

import { useHotelStore } from "../stores/hotel.js";
import { useCategoryStore } from "../stores/category.js";
import { useTimeStore } from "../stores/ratings_over_time";
import ReviewTextsPopup from "./ReviewTextsPopup.vue";

export default {
  components: {ReviewTextsPopup},
  data () {
    return {
      isActive: false
    }
  },
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
    const reviews = inject("reviews");
    const emitter = inject("emitter");
    let date = "";
    let minRatings = {
        'location': .0,
        'value': .0,
        'rooms': .0,
        'service': .0,
        'cleanliness': .0,
        'sleep': .0
    }
    let indices = [];

    return {
      svg,
      hotelStore,
      categoryStore,
      timeStore,
      reviews,
      emitter,
      date,
      minRatings,
      indices,
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
    this.emitter.on(
        "close-popup",
        (params) => {
          this.isActive = false;
        }
    );

    this.plot();
  },
  methods: {
    plot() {
      // remove all previous elements
      d3.select(this.svg).selectAll("*").remove();
      const svg = d3.select(this.svg).append("g");
      const margin = {top: 5, right: 0, bottom: 0, left: 20};
      svg.attr("transform", "translate("+margin.left+", "+margin.top+")");

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
          .range([0, this.width-margin.left-margin.right]);

      // add y axis
      const y = d3
          .scaleLinear()
          .domain([this.yMin, this.yMax])
          .range([this.height-margin.top, 0]);
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

      // add invisible data points for selecting
      const svgId = d3.select(this.svg).attr("id");
      svg.append("circle")
          .attr("id", svgId+"_highlight")
          .attr("fill", this.color)
          .attr("r", 5)
          .attr("opacity", 0);
      // create a d3 tooltip
      const tooltip = d3.select("body")
          .append("div")
          .attr("class", "tooltip")
          .style("visibility", "hidden");
      svg
        .append("g")
        .selectAll("circle")
        .data(data)
        .enter()
        .append("circle")
        .attr("cx", function(d) { return x(+d["timestamp"]) })
        .attr("cy", function(d) { return y(+d["value"]) })
        .attr("r", 5)
        .attr("fill", "none")
        .attr("pointer-events", "all")
        .on("mouseover", (event, d) => {
          d3.select("#"+svgId+"_highlight")
              .attr("opacity", 0.5)
              .attr("cx", x(+d["timestamp"]))
              .attr("cy", y(+d["value"]));
          tooltip.style("visibility", "visible");
          tooltip.style("left", (event.pageX + 10) + "px");
          tooltip.style("top", (event.pageY - 28) + "px");

        })
        .on("mousemove", (event, d) => {
          const date = d3.timeFormat("%b %Y")(new Date(d["timestamp"]));
          let mouseoverText1stLine = date;
          let mouseoverText2ndLine = " Average Rating " + d["value"].toFixed(1) + " / 5.0";
          tooltip.style("left", (event.pageX + 10) + "px");
          tooltip.style("top", (event.pageY - 28) + "px");
          tooltip.html(`${mouseoverText1stLine} </br> ${mouseoverText2ndLine}`);
        })
        .on("mouseout", (event, d) => {
          tooltip.style("visibility", "hidden");
          d3.select("#"+svgId+"_highlight")
              .attr("opacity", 0);
        })
        .on("click", (event, d) => {
          this.indices = [];
          this.minRatings = {
            'location': 5,
            'value': 5,
            'rooms': 5,
            'service': 5,
            'cleanliness': 5,
            'sleep': 5,
          }
          const reviews = Object.assign({}, this.reviews[this.hotelId]["reviews"], this.reviews[this.hotelId]["reviews_unannotated"]);
          if(this.categoryId=='average'){
            for(let l in d["values"]) {
              for(let k in d["values"][l]) {
                this.indices.push({"idx_review": k});
                for(let v in reviews[k]["property_dict"]) {
                  this.minRatings[v] = Math.min(this.minRatings[v], reviews[k]["property_dict"][v]);
                }
              }
            }
          } else {
            for(let k in d["values"]) {
              this.indices.push({"idx_review": k});
              for(let v in reviews[k]["property_dict"]) {
                this.minRatings[v] = Math.min(this.minRatings[v], reviews[k]["property_dict"][v]);
              }
            }
          }
          // open popup with data of these reviews
          this.date = d3.timeFormat("%b %Y")(new Date(d["timestamp"]))
          this.isActive = true;
        });


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

<style lang="scss">
.y-axis {
  size: 2px;
}
.tooltip {
  background-color: grey;
  color: white;
  position: absolute;
  z-index: 10;
  opacity: .9;
  font-size: .875rem;
  line-height: 1.6;
  padding: 5px 16px;
  border-radius: 4px;
}
</style>

<template>
  <svg
    ref="svg"
    :id="'chart_trending_' + this.categoryId + '_' + this.hotelId.replaceAll('.', '_')"
  ></svg>
  <v-dialog
      class="d-flex justify-content-center"
      scrollable
      width="50%"
      v-model="isActive"
  >
    <ReviewTextsPopup
        :hotelId = "hotelId"
        :categoryId = "categoryId"
        :date = "date"
        :minRatings = "minRatings"
        :indices = "indices"
    ></ReviewTextsPopup>
  </v-dialog>
</template>