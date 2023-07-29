<script>
import * as d3 from "d3";

import { ref, onMounted, watch, computed, inject } from "vue";

import { useHotelStore } from "../stores/hotel.js";
import { useCategoryStore } from "../stores/category.js";

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
    const reviews = inject("reviews");
    const hotelMeta = inject('hotelMeta');
    let mouseoverText1stLine = "";
    let mouseoverText2ndLine = "";

    return {
      svg,
      hotelStore,
      categoryStore,
      emitter,
      reviews,
      hotelMeta,
      mouseoverText1stLine,
      mouseoverText2ndLine,
    };
  },
  mounted() {
    d3.select(this.svg)
      .attr("width", this.width)
      .attr("height", this.height)
      .attr("style", "max-width: 100%; height: auto; height: intrinsic;");

    if(this.categoryId == "overall") {
      watch(
          () => this.hotelStore.selectedHotelIds.length,
          () => {
            this.plot();
          }
      );
    }
    watch(
      () => this.categoryStore.relevantCategories,
      () => {
        this.plot();
      }
    );

    this.plot();

    this.emitter.on(
      "highlight_" + this.categoryId + "_" + this.hotelId.replaceAll(".", "_"),
      (params) => {
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
    countsCategoryPosNeg(category, hotelIds) {
      let counts = [];
      if(category == "overall") {
        hotelIds.forEach((hotelId) => {
          counts.push({
            name: hotelId,
            posCount: this.categoryStore.relevantCategories.map(c =>
                this.categoryStore.relevantCategories.length
                * this.categoryStore.normalizedCategoryValues[c["id"]]
                * this.reviews[hotelId]["counts"]["pos"][c["id"]])
                .reduce((a, b) => a + b, 0),
            negCount: this.categoryStore.relevantCategories.map(c =>
                this.categoryStore.relevantCategories.length
                * this.categoryStore.normalizedCategoryValues[c["id"]]
                * this.reviews[hotelId]["counts"]["neg"][c["id"]])
                .reduce((a, b) => a + b, 0),
          });
        });
      } else {
        hotelIds.forEach((hotelId) => {
          counts.push({
            name: hotelId,
            posCount: this.reviews[hotelId]["counts"]["pos"][category],
            negCount: this.reviews[hotelId]["counts"]["neg"][category],
          });
        });
      }
      return counts;
    },
    plot() {
      // get values for each hotel
      let hotels = this.hotelId;
      if(this.hotelId=="selected") {
        hotels = this.hotelStore.selectedHotelIds;
      } else {
        hotels = [this.hotelId];
      }
      const data = this.countsCategoryPosNeg(this.categoryId, hotels);
      const height = 10*hotels.length;
      d3.select(this.svg).attr("height", height);

      const neg = Math.round(10000*data.find(h => h["name"]==this.hotelId)["negCount"])/100;
      const pos = Math.round(10000*data.find(h => h["name"]==this.hotelId)["posCount"])/100;
      this.mouseoverText1stLine = this.hotelMeta[this.hotelId].name;
      if(this.categoryId=="overall") {
        this.mouseoverText2ndLine = "The categories are ";
      } else {
        this.mouseoverText2ndLine = "The category " + this.categoryStore.categoriesById[this.categoryId]["title"] + " is";
      }
      this.mouseoverText2ndLine += " mentioned negatively in "+neg +"%, and positively in "+ pos + "% of the reviews."


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
        .call(d3.axisLeft(y).tickSizeOuter(0).tickValues([]))
        .selectAll("path")
        .attr("stroke-width", "2px");
      svg.selectAll("text").remove();
    },

    highlight(svgId, categoryId, hotelId, num_items, polarity) {
      const svg = d3.select(
        "#" + categoryId + "_" + hotelId.replaceAll(".", "_")
      );
      const svgOverall = d3.select(
          "#overall_" + hotelId.replaceAll(".", "_")
      );

      // x axis
      let xScale = 1;
      const x = d3
        .scaleLinear()
        .domain([-xScale, xScale])
        .range([0, svg.attr("width")]);
      xScale = 2;
      const xOverall = d3
          .scaleLinear()
          .domain([-xScale, xScale])
          .range([0, svgOverall.attr("width")]);

      // y axis
      const y = d3
        .scaleBand()
        .domain([hotelId])
        .range([0, svg.attr("height")])
        .padding(0.1);

      let xValue = num_items / this.reviews[hotelId]["review_count"];
      let xValueScale = 0;
      let width = x(xValue) - x(0);
      if (polarity == "neg") {
        width = x(0) - x(-xValue);
        xValueScale = -xValue;
      }

      // bars
      svg
        .select("g")
        .append("rect")
        .attr("class", "highlight")
        .attr("y", y(hotelId))
        .attr("x", x(xValueScale))
        .attr("width", width)
        .attr("height", y.bandwidth())
        .attr("fill", "black")
        .attr("stroke-width", "1px")
        .attr("stroke", "white");
      svgOverall
        .select("g")
        .append("rect")
        .attr("class", "highlight")
        .attr("y", y(hotelId))
        .attr("x", xOverall(xValueScale))
        .attr("width", width)
        .attr("height", y.bandwidth())
        .attr("fill", "black")
        .attr("stroke-width", "1px")
        .attr("stroke", "white");
    },

    unhighlight(categoryId, hotelId) {
      d3.select("#" + categoryId + "_" + hotelId.replaceAll(".", "_"))
        .selectAll(".highlight")
        .remove();
      d3.select("#overall_" + hotelId.replaceAll(".", "_"))
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
</style>

<template>
  <svg
    ref="svg"
    :id="this.categoryId + '_' + this.hotelId.replaceAll('.', '_')"
    :width="this.width"
    :height="this.height"
  ></svg>
  <v-tooltip id="'tooltip' + '_' + this.hotelId.replaceAll('.', '_')" activator="parent" location="bottom" max-width="500px">
    {{ mouseoverText1stLine }}
    <br />
    {{ mouseoverText2ndLine }}
  </v-tooltip>
</template>