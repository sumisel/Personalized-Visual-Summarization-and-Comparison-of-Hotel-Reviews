<script>
import * as d3 from "d3";

import { inject, ref } from "vue";

import { useHotelStore } from "@/stores/hotel";
import { usePoiStore } from "@/stores/poi";

export default {
  setup() {
    const map = ref();
    const hotelStore = useHotelStore();
    const poiStore = usePoiStore();
    const hotelMeta = inject("hotelMeta");

    function updateSelectedHotels() {
      d3.select("#svg-map")
        .select(".markers")
        .selectAll("circle")
        .transition()
        .attr("fill", (d) =>
          this.hotelStore.hotelIsSelected(d.id) ? "black" : "white"
        );
    }

    return {
      map,
      hotelStore,
      poiStore,
      hotelMeta,
      updateSelectedHotels,
    };
  },
  data() {
    return {
      focusedHotel: "",
      selectionChanged: false,
    };
  },
  mounted() {
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
        .style("stroke", "#ccb")
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
      .data(Object.values(this.hotelMeta))
      .enter()
      .append("circle")
      .attr("cx", (d) => projection([d.location.long, d.location.lat])[0])
      .attr("cy", (d) => projection([d.location.long, d.location.lat])[1])
      .attr("r", 10)
      .attr("stroke", "black")
      .attr("fill", "#ccc")
      .attr("stroke-width", "2px")
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

    this.updateSelectedHotels();
  },
  computed: {
    districtsOfSelectedHotels() {
      const districts = this.hotelStore.selectedHotelIds.map(
        (hotelId) => this.hotelMeta[hotelId].district
      );
      return [...new Set(districts.filter((district) => district))];
    },
    poisWithAllPositiveScores() {
      const positivePois = [];
      this.poiStore.selectedPois.forEach((poi) => {
        let positive = true;
        this.hotelStore.selectedHotelIds.forEach((hotelId) => {
          if (!this.hotelMeta[hotelId].poiInfo[poi].startsWith("(+)")) {
            positive = false;
          }
        });
        if (positive) {
          positivePois.push(poi);
        }
      });
      return positivePois;
    },
  },
};
</script>

<template>
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
      <v-alert
        class="mb-2 mt-2 instruction text-center"
        v-if="
          !selectionChanged ||
          hotelStore.selectedHotelIds.length < 2 ||
          poiStore.selectedPois.length === 0
        "
      >
        <span v-if="!selectionChanged"
          >Click a marker to focus a hotel, and then (de)select it using the
          switch.
        </span>
        <strong v-if="hotelStore.selectedHotelIds.length < 2"
          >Select more than one hotel to compare.
        </strong>
        <strong v-if="poiStore.selectedPois.length === 0"
          >Choose your favorite points of interests, to see related information.
        </strong>
      </v-alert>
      <div class="hotel-header elevation-6 d-flex" v-if="focusedHotel">
        <div class="text-h5">{{ hotelMeta[focusedHotel]?.name }}</div>
      </div>
      <div class="switch-container" v-if="focusedHotel">
        <v-switch
          :model-value="hotelStore.hotelIsSelected(focusedHotel)"
          color="black"
          @change="
            hotelStore.toggleHotelSelection(focusedHotel);
            updateSelectedHotels();
            selectionChanged = true;
          "
        >
        </v-switch>
      </div>
      <div
        class="hotel-details elevation-4"
        v-if="focusedHotel && poiStore.selectedPois.length"
      >
        <v-chip
          v-for="poi in poiStore.selectedPois.filter(
            (poi) => hotelMeta[focusedHotel]?.poiInfo[poi]
          )"
          :key="poi"
        >
          <v-icon
            start
            :icon="
              hotelMeta[focusedHotel]?.poiInfo[poi].startsWith('(+)')
                ? 'mdi-plus'
                : hotelMeta[focusedHotel]?.poiInfo[poi].startsWith('(-)')
                ? 'mdi-minus'
                : 'mdi-plus-minus'
            "
          ></v-icon>
          <v-icon start :icon="$poiMeta[poi].icon"></v-icon>
          <span
            v-html="
              hotelMeta[focusedHotel]?.poiInfo[poi].replace(/^\([+-]\) /, '')
            "
          ></span>
        </v-chip>
      </div>
    </div>
  </div>
  <div class="text mt-4">
    Among the available
    <strong>{{ Object.keys(hotelMeta).length }}</strong> hotels
    <v-icon class="inline" icon="mdi-circle-outline" size="x-small"></v-icon>,
    <span v-if="hotelStore.selectedHotelIds.length > 1"
      ><strong>{{ hotelStore.selectedHotelIds.length }}</strong> are</span
    >
    <span v-if="hotelStore.selectedHotelIds.length === 1"
      >only <strong>1</strong> is</span
    >
    <span v-if="hotelStore.selectedHotelIds.length === 0"
      ><strong>none</strong> is</span
    >
    selected<span v-if="hotelStore.selectedHotelIds.length > 1">: </span
    ><span v-else>! </span>
    <span
      v-for="(hotelId, index) in hotelStore.selectedHotelIds"
      :key="hotelId"
    >
      <strong
        ><v-icon class="inline" icon="mdi-circle" size="x-small"></v-icon>
        {{ hotelMeta[hotelId].name }}</strong
      ><span v-if="index < hotelStore.selectedHotelIds.length - 1">, </span
      ><span v-else>. </span>
    </span>
    <span
      v-if="
        hotelStore.selectedHotelIds.length > 1 &&
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
  <div
    class="text mt-4"
    v-if="
      hotelStore.selectedHotelIds.length > 1 && poiStore.selectedPois.length > 0
    "
  >
    <span v-if="poisWithAllPositiveScores.length > 0"
      >With respect to
      <span v-for="(poi, index) in poisWithAllPositiveScores" :key="poi"
        ><v-chip
          ><v-icon start :icon="$poiMeta[poi].icon"></v-icon> {{ poi }}</v-chip
        ><span v-if="index < poisWithAllPositiveScores.length - 2">, </span
        ><span v-else-if="index === poisWithAllPositiveScores.length - 2">
          and
        </span> </span
      >, the selected hotels are all in a favorable location.
    </span>
  </div>
</template>

<style lang="scss">
.text {
  & .v-icon.inline {
    display: relative;
    top: -2px;
  }
  & .v-chip {
    display: relative;
    top: -2px;
  }
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
    & > div {
      position: absolute;
    }
    & .instruction {
      font-style: italic;
      background-color: rgba(200, 200, 200, 0.8);
      color: #444;
      font-size: 0.9rem;
      top: -590px;
      width: 100%;
      padding: 0.2rem;
    }

    & .hotel-header {
      background-color: rgba(255, 255, 255, 0.8);
      top: -530px;
      left: 27.5%;
      width: 40%;
      height: 80px;
      padding: 0 20px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    & .switch-container {
      top: -500px;
      left: 62.8%;
    }
    & .hotel-details {
      background-color: rgba(255, 255, 255, 0.8);
      top: -160px;
      left: 17.5%;
      width: 60%;
      max-height: 150px;
      padding: 10px;
      & .v-chip {
        margin: 2px;
      }
    }
  }
}
</style>