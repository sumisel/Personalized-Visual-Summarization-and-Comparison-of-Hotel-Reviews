<script>
import * as d3 from "d3";

import { ref, onMounted, watch, computed, inject } from "vue";

import { useHotelStore } from "../stores/hotel.js";
import { useCategoryStore } from "../stores/category.js";
import HotelName from "./HotelName.vue";
import CategoryName from "./CategoryName.vue";

export default {
  components: {
    CategoryName,
    HotelName,
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
    let neg = 0;
    let pos = 0;

    return {
      svg,
      hotelStore,
      categoryStore,
      emitter,
      reviews,
      hotelMeta,
      neg,
      pos,
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
      "highlight_" + this.categoryId,
      (params) => {
        this.highlight(params["categoryId"], this.hotelId);
      }
    );
    this.emitter.on(
      "unhighlight",
      (params) => {
        this.unhighlight();
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
                * this.categoryStore.normalizedRelevantCategoryValues[c["id"]]
                * this.reviews[hotelId]["counts"]["pos"][c["id"]])
                .reduce((a, b) => a + b, 0),
            negCount: this.categoryStore.relevantCategories.map(c =>
                this.categoryStore.relevantCategories.length
                * this.categoryStore.normalizedRelevantCategoryValues[c["id"]]
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
      d3.select(this.svg)
          .attr("height", height);

      this.neg = Math.round(100*data.find(h => h["name"]==this.hotelId)["negCount"]);
      this.pos = Math.round(100*data.find(h => h["name"]==this.hotelId)["posCount"]);
      if(this.categoryId=="overall") {
        this.pos = 0;
        this.neg = 0;
        for (let category of this.categoryStore.relevantCategories) {
          const counts = this.countsCategoryPosNeg(category["id"], [this.hotelId])[0];
          this.pos += counts["posCount"];
          this.neg += counts["negCount"];
        }
        this.neg = Math.round(100*this.neg);
        this.pos = Math.round(100*this.pos);
      }


      // remove all previous elements
      d3.select(this.svg).selectAll("*").remove();
      const svg = d3.select(this.svg).append("g");

      // x axis
      const x = d3
        .scaleLinear()
        .domain([this.xMin, this.xMax])
        .range([0, this.width]);

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
        .selectAll("rect")
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
      d3.select(this.svg)
        .on("mouseover", (d) => {
            if(this.categoryId== "overall") {
              d3.selectAll(".overallChart").selectAll("rect").attr("opacity", 0.2);
              d3.select(d.currentTarget).selectAll("rect").attr("opacity", 1);
            }
        })
        .on("mouseout", (d) => {
          if(this.categoryId== "overall") {
            d3.selectAll(".overallChart").selectAll("rect").attr("opacity", 1);
          }
        })

      // add the y Axis on top of the bars
      svg
        .append("g")
        .attr("class", "zero-axis")
        .attr("transform", "translate(" + (x(0) - 0.5) + ",0)")
        .call(d3.axisLeft(y).tickSizeOuter(0).tickValues([]))
        .selectAll("path")
        .attr("stroke-width", "2px");
      svg.selectAll("text").remove();
    },

    highlight(categoryId, hotelId) {
      if(this.categoryStore.relevantCategories.filter(category => category.id == categoryId).length == 0) {
        return;
      }

      const svgOverall = d3.select(
          "#overall_" + this.hotelId.replaceAll(".", "_")
      );

      // x axis
      let xScale = 3.25;
      const x = d3
          .scaleLinear()
          .domain([-xScale, xScale])
          .range([0, 2.5*this.width]);

      // y axis
      const y = d3
          .scaleBand()
          .domain([hotelId])
          .range([0, this.height])
          .padding(0.1);

      let counts = this.countsCategoryPosNeg(categoryId, [hotelId])[0];
      counts["posCount"] = counts["posCount"] *this.categoryStore.relevantCategories.length* this.categoryStore.normalizedRelevantCategoryValues[categoryId];
      counts["negCount"] = counts["negCount"] *this.categoryStore.relevantCategories.length* this.categoryStore.normalizedRelevantCategoryValues[categoryId];

      // bars
      svgOverall
          .select("g")
          .append("rect")
          .attr("class", "highlight")
          .attr("y", y(hotelId))
          .attr("x", function (d) {
            return x(-counts["negCount"]);
          })
          .attr("width", function (d) {
            return x(counts["posCount"]) - x(-counts["negCount"]);
          })
          .attr("height", y.bandwidth())
          .attr("fill", this.categoryStore.categoriesById[categoryId]["color"]);

      // re-add axis in front of bars
      const axes = d3.selectAll(".zero-axis");
      axes.each(function () {
        this.parentNode.appendChild(this);
      });
    },

    unhighlight() {
      for(let hotelId of this.hotelStore.selectedHotelIds) {
        d3.select("#overall_" + hotelId.replaceAll(".", "_"))
            .selectAll(".highlight")
            .remove();
      }
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
  ></svg>
  <v-tooltip id="'tooltip' + '_' + this.hotelId.replaceAll('.', '_')" activator="parent" location="bottom" max-width="500px">
    <HotelName :hotelId="this.hotelId" avatar></HotelName>
    <br />
    <CategoryName v-if="this.categoryId!='overall'" :categoryId="this.categoryId"></CategoryName>
    <div style="display: inline-block" v-else>The categories</div>
    <div style="display: inline-block" v-if="this.categoryId=='overall' || this.categoryId=='rooms'">&nbsp;are</div>
    <div style="display: inline-block" v-else>&nbsp;is</div>
    mentioned <b>negatively in {{ neg }}%</b>, and <b>positively in {{ pos }}%</b> of the reviews
    <div style="display: inline-block" v-if="this.categoryId=='overall'">&nbsp;(multiple mentions per review possible)</div>
    .
  </v-tooltip>
</template>