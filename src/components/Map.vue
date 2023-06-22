<script>
import * as d3 from "d3";

import { ref } from "vue";

import { useHotelStore } from "@/stores/hotel";
import { usePoiStore } from "@/stores/poi";

export default {
  setup() {
    const map = ref();
    const hotelStore = useHotelStore();
    const poiStore = usePoiStore();

    return {
      map,
      hotelStore,
      poiStore,
    };
  },
  data() {
    return {
      focusedHotel: "",
    };
  },
  mounted() {
    function updateSelectedHotels() {
      markers.attr("stroke-width", (d) => (d.isSelected ? 6 : 2));
    }

    function resetAllMarkers() {
      svg
        .select(".markers")
        .selectAll("circle")
        .attr("opacity", 1)
        .attr("r", 10);
    }

    function resetZoom() {
      resetAllMarkers();
      svg.select(".map-container").transition().attr("transform", "");
      that.focusedHotel = "";
    }

    const that = this;

    const cityId = this.$city.name.replace(" ", "_").toLowerCase();

    const width = d3.select("#app").node().getBoundingClientRect().width - 344;
    const height = 600;
    const svg = d3
      .select("#svg-map")
      .attr("width", width)
      .attr("height", height)
      .on("click", resetZoom);

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

    // draw sightseeing
    d3.json(`./geo/sightseeing_${cityId}.geojson`).then((geojson) => {
      const path = d3.geoPath().projection(projection);
      svg
        .select(".sightseeing")
        .selectAll("path")
        .data(geojson.features)
        .enter()
        .append("path")
        .attr("fill", "none")
        .attr("d", path)
        .style("stroke", "#aa8")
        .style("stroke-width", "2px");
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
        .attr("fill", "#bbb")
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
      .attr("r", 10)
      .attr("stroke", "black")
      .attr("fill", "#ccc")
      // select on right click
      .on("contextmenu", (event, d) => {
        const hotel = this.hotelStore.hotels.find((hotel) => hotel.id === d.id);
        hotel.isSelected = hotel.isSelected ? 0 : 1;
        updateSelectedHotels();
      })
      // focus on click
      .on("click", (event, d) => {
        this.focusedHotel = d.id;
        resetAllMarkers();
        d3.select(event.target).transition().attr("r", 60).attr("opacity", 0.5);
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
        // zoom on the selected hotel
        const x = projection([d.location.long, d.location.lat])[0];
        const y = projection([d.location.long, d.location.lat])[1];
        const k = 2;
        svg
          .select(".map-container")
          .transition()
          .attr(
            "transform",
            `translate(${width / 2}, ${
              height / 2
            }) scale(${k}) translate(${-x}, ${-y})`
          );
        event.stopPropagation();
      });

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
    Please click a marker to focus a hotel, and right-click to select/deselect
    one.
    <strong v-if="hotelStore.selectedHotels.length < 2"
      >Select more than one hotel to compare.</strong
    >
  </div>
  <div class="map-container">
    <svg id="svg-map" class="map">
      <g class="map-container">
        <g class="districts"></g>
        <g class="waterways"></g>
        <g class="roads"></g>
        <g
          class="sightseeing"
          v-show="poiStore.selectedPois.includes('sightseeing')"
        ></g>
        <g
          class="restaurants"
          v-show="poiStore.selectedPois.includes('restaurants')"
        ></g>
        <g class="markers"></g>
      </g>
    </svg>
    <div class="dummy"></div>
    <div class="map-overlay">
      <div class="hotel-header text-h5" v-if="focusedHotel">
        {{ $hotelMeta[focusedHotel]?.name }}
      </div>
      <div class="hotel-details">
        <ul>
          <li v-for="poi in poiStore.selectedPois" :key="poi">
            {{ $hotelMeta[focusedHotel]?.poiInfo[poi] }}
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<style lang="scss">
.instruction {
  font-style: italic;
  color: gray;
  font-size: 0.9rem;
}

.map-container {
  & .map {
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

  & .dummy {
    height: 600px;
  }

  & .map-overlay {
    position: relative;
    & .hotel-header {
      position: absolute;
      top: -530px;
      left: 22.5%;
      width: 50%;
      height: 80px;
      background-color: white;
      padding: 0 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      text-align: center;
      box-shadow: 2px 2px 10px rgba(0, 0, 0, 0.3);
    }
  }
}
</style>