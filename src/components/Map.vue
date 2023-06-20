<script>
import * as d3 from "d3";

import { ref } from "vue";

import "leaflet/dist/leaflet.css";
import {
  LMap,
  LTileLayer,
  LMarker,
  LTooltip,
  LIcon,
} from "@vue-leaflet/vue-leaflet";
import { useHotelStore } from "@/stores/hotel";

export default {
  components: {
    LMap,
    LTileLayer,
    LMarker,
    LTooltip,
    LIcon,
  },
  setup() {
    const map = ref();
    const hotelStore = useHotelStore();

    return {
      map,
      hotelStore,
    };
  },
  mounted() {
    const width = d3.select("#app").node().getBoundingClientRect().width - 344;
    const height = 600;
    const svg = d3
      .select("#svg-map")
      .attr("width", width)
      .attr("height", height);

    console.log(this.$city.center);

    const projection = d3
      .geoMercator()
      .scale(400000)
      .center([this.$city.center[1], this.$city.center[0]])
      .translate([width / 2, height / 2]);

    d3.json(
      "https://raw.githubusercontent.com/funkeinteraktiv/Berlin-Geodaten/master/berlin_bezirke.geojson"
    ).then((geojson) => {
      const path = d3.geoPath().projection(projection);
      svg
        .selectAll("path")
        .data(geojson.features)
        .enter()
        .append("path")
        .attr("fill", "none")
        .attr("d", path)
        .style("stroke", "#000");
    });

    // draw markers for each hotel
    const markers = svg
      .selectAll("circle")
      .data(Object.values(this.$hotelMeta))
      .enter()
      .append("circle")
      .attr("cx", (d) => projection([d.location.long, d.location.lat])[0])
      .attr("cy", (d) => projection([d.location.long, d.location.lat])[1])
      .attr("r", 10)
      .attr("fill", "#888")
      .attr("stroke", "black")
      .attr("stroke-width", 2)
      .on("click", (event, d) => {
        console.log(d.name);
      });
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
  <svg id="svg-map" class="map"></svg>
  <!--div class="map">
    <l-map
      ref="map"
      :center="$city.center"
      :zoom="$city.zoom"
      :minZoom="$city.zoom"
      :maxZoom="$city.zoom"
      :useGlobalLeaflet="false"
      :options="{
        zoomControl: false,
        scrollWheelZoom: false,
        doubleClickZoom: false,
        dragging: false,
        attributionControl: false,
      }"
    >
      <l-tile-layer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        layer-type="base"
        name="OpenStreetMap"
      ></l-tile-layer>
      <l-marker
        v-for="(hotel, index) in hotelStore.hotels.filter(
          (hotel) =>
            $hotelMeta[hotel.id].location.lat &&
            $hotelMeta[hotel.id].location.long
        )"
        :key="index"
        :lat-lng="[
          $hotelMeta[hotel.id].location.lat,
          $hotelMeta[hotel.id].location.long,
        ]"
        @click="
          hotel.isSelected = hotel.isSelected
            ? 0
            : hotelStore.selectedHotels.reduce(
                // set to highest index plus 1
                (max, hotel) => (max = Math.max(max, hotel.isSelected)),
                0
              ) + 1
        "
      >
        <l-tooltip>{{ $hotelMeta[hotel.id].name }}</l-tooltip>
        <l-icon
          :icon-url="
            hotel.isSelected
              ? 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png'
              : 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-grey.png'
          "
        ></l-icon>
      </l-marker>
    </l-map>
  </div-->
  <div class="dummy"></div>
</template>

<style lang="scss" scoped>
.map {
  height: 600px;
  width: calc(100vw - 344px);
  left: 0;
  position: absolute;
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