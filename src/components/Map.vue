<script>
import * as d3 from "d3";

import { ref } from "vue";

import { useHotelStore } from "@/stores/hotel";

export default {
  setup() {
    const map = ref();
    const hotelStore = useHotelStore();

    return {
      map,
      hotelStore,
    };
  },
  mounted() {
    function updateSelectedHotels() {
      markers
        .attr("fill", (d) => (d.isSelected ? "#000" : "#ccc"))
        .attr("stroke", "black")
        .attr("stroke-width", 2);
    }

    function resetAllMarkers() {
      svg
        .select(".markers")
        .selectAll("circle")
        .attr("opacity", 1)
        .attr("r", 15);
      svg
        .select(".markers")
        .selectAll("text")
        .attr("opacity", 0)
        .attr("font-size", "0");
    }

    const cityId = this.$city.name.replace(" ", "_").toLowerCase();

    const width = d3.select("#app").node().getBoundingClientRect().width - 344;
    const height = 600;
    const svg = d3
      .select("#svg-map")
      .attr("width", width)
      .attr("height", height);

    console.log(this.$city.center);

    const projection = d3
      .geoMercator()
      .scale(600000)
      .center([this.$city.center[1], this.$city.center[0]])
      .translate([width / 2, height / 2]);

    // draw districts
    d3.json(`./geo/districts_${cityId}.geojson`).then((geojson) => {
      var polygonsOnly = geojson.features.filter(function (feature) {
        return (
          feature.geometry.type === "Polygon" ||
          feature.geometry.type === "MultiPolygon"
        );
      });
      const path = d3.geoPath().projection(projection);
      svg
        .select(".districts")
        .selectAll("path")
        .data(polygonsOnly)
        .enter()
        .append("path")
        .attr("fill", "none")
        .attr("d", path)
        .style("stroke", "#eaeaea")
        .style("stroke-width", "20px");
    });

    // draw waterways
    d3.json(`./geo/waterways_${cityId}.geojson`).then((geojson) => {
      var linesOnly = geojson.features.filter(function (feature) {
        return feature.geometry.type === "LineString";
      });
      const path = d3.geoPath().projection(projection);
      svg
        .select(".waterways")
        .selectAll("path")
        .data(linesOnly)
        .enter()
        .append("path")
        .attr("fill", "none")
        .attr("d", path)
        .style("stroke", "#cdf")
        .style("stroke-width", "12px");
    });

    // draw roads
    d3.json(`./geo/roads_${cityId}.geojson`).then((geojson) => {
      var linesOnly = geojson.features.filter(function (feature) {
        return feature.geometry.type === "LineString";
      });
      const path = d3.geoPath().projection(projection);
      svg
        .select(".roads")
        .selectAll("path")
        .data(linesOnly)
        .enter()
        .append("path")
        .attr("fill", "none")
        .attr("d", path)
        .style("stroke", "#fee")
        .style("stroke-width", "4px");
    });

    // draw restaurants
    d3.json(`./geo/restaurants_${cityId}.geojson`).then((geojson) => {
      var pointsOnly = geojson.features.filter(function (feature) {
        return feature.geometry.type === "Point";
      });
      const path = d3.geoPath().projection(projection);
      svg
        .select(".restaurants")
        .selectAll("path")
        .data(pointsOnly)
        .enter()
        .append("path")
        .attr("fill", "#aaa")
        .attr("d", path.pointRadius(2));
    });

    // draw markers for each hotel
    const markers = svg
      .select(".markers")
      .selectAll("circle")
      .data(Object.values(this.$hotelMeta))
      .enter()
      .append("circle")
      .attr("cx", (d) => projection([d.location.long, d.location.lat])[0])
      .attr("cy", (d) => projection([d.location.long, d.location.lat])[1])
      .attr("r", 15)
      .attr("stroke", "black")
      .attr("stroke-width", 2)
      .on("click", (event, d) => {
        const hotel = this.hotelStore.hotels.find((hotel) => hotel.id === d.id);
        hotel.isSelected = hotel.isSelected ? 0 : 1;
        updateSelectedHotels();
      })
      .on("mouseover", (event, d) => {
        resetAllMarkers();
        d3.select(event.target).transition().attr("r", 20);
        svg
          .select(".markers")
          .selectAll("text")
          .filter((text) => text.id === d.id)
          .transition()
          .attr("opacity", 1)
          .attr("font-size", "20px");
        svg
          .select(".markers")
          .selectAll("circle")
          .filter((circle) => circle.id !== d.id)
          .transition()
          .attr("opacity", 0.2);
      })
      .on("mouseout", (event, d) => {
        resetAllMarkers();
      });

    // add hotel names as hidden text labels
    svg
      .select(".markers")
      .selectAll("text")
      .data(Object.values(this.$hotelMeta))
      .enter()
      .append("text")
      .attr("x", (d) => projection([d.location.long, d.location.lat])[0])
      .attr("y", (d) => projection([d.location.long, d.location.lat])[1] - 30)
      .attr("text-anchor", "middle")
      .attr("font-size", "0")
      .attr("fill", "black")
      .text((d) => d.name)
      .attr("opacity", 0);

    updateSelectedHotels();
  },
  computed: {
    districtsOfSelectedHotels() {
      const districts = this.hotelStore.selectedHotels.map(
        (hotel) => this.$hotelMeta[hotel.id].district
      );
      return [...new Set(districts.filter((district) => district))];
    },
  },
};
</script>

<template>
  <div>
    Among the available
    <strong>{{ Object.keys($hotelMeta).length }}</strong> hotels,
    <span v-if="hotelStore.selectedHotels.length > 1"
      ><strong>{{ hotelStore.selectedHotels.length }}</strong> are</span
    >
    <span v-if="hotelStore.selectedHotels.length === 1"
      >only <strong>1</strong> is</span
    >
    <span v-if="hotelStore.selectedHotels.length === 0"
      ><strong>none</strong> is</span
    >
    selected.
    <span
      v-if="
        hotelStore.selectedHotels.length > 1 &&
        districtsOfSelectedHotels.length > 0
      "
      >They are
      <span v-if="districtsOfSelectedHotels.length === 1"
        >all located in
        <strong
          >{{ this.$city.name }} {{ districtsOfSelectedHotels[0] }}</strong
        ></span
      ><span v-else
        >located in <strong>{{ this.$city.name + " " }}</strong>
        <span v-if="districtsOfSelectedHotels.length === 2">
          <strong>{{ districtsOfSelectedHotels[0] }}</strong> and
          <strong>{{ districtsOfSelectedHotels[1] }}</strong></span
        ><span v-else
          >{{ districtsOfSelectedHotels.length }} districts</span
        > </span
      >.</span
    >
  </div>
  <div class="ml-12 mt-4 instruction">
    Please click a marker to select/deselect a hotel.
    <strong v-if="hotelStore.selectedHotels.length < 2"
      >Select more than one hotel to compare.</strong
    >
  </div>
  <svg id="svg-map" class="map">
    <g class="districts"></g>
    <g class="waterways"></g>
    <g class="roads"></g>
    <g class="restaurants"></g>
    <g class="markers"></g>
  </svg>
  <div class="dummy"></div>
</template>

<style lang="scss">
.map {
  height: 600px;
  width: calc(100vw - 344px);
  left: 0;
  position: absolute;
  & .markers {
    & circle {
      cursor: pointer;
      filter: drop-shadow(2px 2px 4px rgba(0, 0, 0, 0.3));
    }
  }
}

.dummy {
  height: 600px;
}

.instruction {
  font-style: italic;
  color: gray;
  font-size: 0.9rem;
}
</style>