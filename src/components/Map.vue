<script>
import * as d3 from "d3";

import { inject, ref } from "vue";

import { useHotelStore } from "@/stores/hotel";
import { usePoiStore } from "@/stores/poi";

import InlineListItem from "./InlineListItem.vue";
import PoiChip from "./PoiChip.vue";

export default {
  components: {
    InlineListItem,
    PoiChip,
  },
  setup() {
    const map = ref();
    const hotelStore = useHotelStore();
    const poiStore = usePoiStore();
    const hotelMeta = inject("hotelMeta");
    const hotelIds = Object.keys(hotelMeta);
    const city = inject("city");
    const poiMeta = inject("poiMeta");
    const reviews = inject("reviews");

    const projection = undefined;
    const width = undefined;
    const height = undefined;

    return {
      map,
      hotelStore,
      poiStore,
      hotelMeta,
      hotelIds,
      city,
      poiMeta,
      reviews,
      projection,
      width,
      height,
    };
  },
  data() {
    return {
      focusedHotel: "",
      selectionChanged: false,
    };
  },
  methods: {
    resetAllMarkers() {
      d3.select("#svg-map")
        .select(".markers")
        .selectAll("circle")
        .attr("opacity", 1)
        .attr("r", 10);
    },
    focusOnHotel(hotelId) {
      this.focusedHotel = hotelId;
      this.resetAllMarkers();
      d3.select(`#svg-map .markers circle[id="${hotelId}"]`)
        .transition()
        .attr("r", 60)
        .attr("opacity", 0.5);
      const svg = d3.select("#svg-map");
      svg
        .select(".markers")
        .selectAll("circle")
        .filter((circle) => circle.id !== hotelId)
        .attr("opacity", 0.2);
      // zoom on the selected hotel
      const projectedLocation = this.projection([
        this.hotelMeta[hotelId].location.long,
        this.hotelMeta[hotelId].location.lat,
      ]);
      const x = projectedLocation[0];
      const y = projectedLocation[1];
      const k = 2;
      svg
        .select(".map-container")
        .transition()
        .attr(
          "transform",
          `translate(${this.width / 2}, ${
            this.height / 2
          }) scale(${k}) translate(${-x}, ${-y})`
        );
    },
    resetZoom() {
      this.resetAllMarkers();
      d3.select("#svg-map")
        .select(".map-container")
        .transition()
        .attr("transform", "");
      this.focusedHotel = "";
    },
    updateSelectedHotels() {
      d3.select("#svg-map")
        .select(".markers")
        .selectAll("circle")
        .transition()
        .attr("fill", (d) =>
          this.hotelStore.hotelIsSelected(d.id) ? "black" : "white"
        );
    },
  },
  mounted() {
    const cityId = this.city.name.replace(" ", "_").toLowerCase();

    this.width = d3.select("#app").node().getBoundingClientRect().width - 344;
    this.height = 600;
    const svg = d3
      .select("#svg-map")
      .attr("width", this.width)
      .attr("height", this.height)
      .on("click", this.resetZoom);

    this.projection = d3
      .geoMercator()
      .scale(600000)
      .center([this.city.center[1], this.city.center[0]])
      .translate([this.width / 2, this.height / 2]);

    // draw districts
    d3.json(`./geo/districts_${cityId}.geojson`).then((geojson) => {
      var polygonsOnly = geojson.features.filter(function (feature) {
        return (
          feature.geometry.type === "Polygon" ||
          feature.geometry.type === "MultiPolygon"
        );
      });
      const path = d3.geoPath().projection(this.projection);
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
      const path = d3.geoPath().projection(this.projection);
      svg
        .select(".waterways")
        .selectAll("path")
        .data(linesOnly)
        .enter()
        .append("path")
        .attr("fill", "none")
        .attr("d", path)
        .style("stroke", "#dff8fa")
        .style("stroke-width", "12px");
    });

    // draw roads
    d3.json(`./geo/roads_${cityId}.geojson`).then((geojson) => {
      var linesOnly = geojson.features.filter(function (feature) {
        return feature.geometry.type === "LineString";
      });
      const path = d3.geoPath().projection(this.projection);
      svg
        .select(".roads")
        .selectAll("path")
        .data(linesOnly)
        .enter()
        .append("path")
        .attr("fill", "none")
        .attr("d", path)
        .style("stroke", "#f5f5f5")
        .style("stroke-width", "4px");
    });

    // draw sightseeing
    d3.json(`./geo/sightseeing_${cityId}.geojson`).then((geojson) => {
      const path = d3.geoPath().projection(this.projection);
      svg
        .select(".sightseeing")
        .selectAll("path")
        .data(geojson.features)
        .enter()
        .append("path")
        .attr("fill", "none")
        .attr("d", path)
        .style("stroke", this.poiMeta.sightseeing.color)
        .style("stroke-width", "2px");
    });

    // draw restaurants
    d3.json(`./geo/restaurants_${cityId}.geojson`).then((geojson) => {
      var pointsOnly = geojson.features.filter(function (feature) {
        return feature.geometry.type === "Point";
      });
      const path = d3.geoPath().projection(this.projection);
      svg
        .select(".restaurants")
        .selectAll("path")
        .data(pointsOnly)
        .enter()
        .append("path")
        .attr("fill", this.poiMeta.restaurants.color)
        .attr("d", path.pointRadius(2));
    });

    // draw public transport stations
    d3.json(`./geo/public_transport_${cityId}.geojson`).then((geojson) => {
      const path = d3.geoPath().projection(this.projection);
      svg
        .select(".public_transport")
        .selectAll("path")
        .data(geojson.features)
        .enter()
        .append("path")
        .attr("fill", this.poiMeta.public_transport.color)
        .attr("d", path.pointRadius(6));
    });

    // draw markers for each hotel
    const markers = svg
      .select(".markers")
      .selectAll("circle")
      .data(
        Object.entries(this.hotelMeta).map(([id, meta]) => ({ id, ...meta }))
      )
      .enter()
      .append("circle")
      .attr("id", (d) => d.id)
      .attr("cx", (d) => this.projection([d.location.long, d.location.lat])[0])
      .attr("cy", (d) => this.projection([d.location.long, d.location.lat])[1])
      .attr("r", 10)
      .attr("stroke", "black")
      .attr("stroke-width", "2px")
      .on("click", (event, d) => {
        this.focusOnHotel(d.id);
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
          if (!this.hotelMeta[hotelId].poiInfo[poi]?.startsWith("(+)")) {
            positive = false;
          }
        });
        if (positive) {
          positivePois.push(poi);
        }
      });
      return positivePois;
    },
    hotelsWithAllPositiveScores() {
      const positiveHotels = [];
      this.hotelStore.selectedHotelIds.forEach((hotelId) => {
        let positive = true;
        this.poiStore.selectedPois.forEach((poi) => {
          if (!this.hotelMeta[hotelId].poiInfo[poi]?.startsWith("(+)")) {
            positive = false;
          }
        });
        if (positive) {
          positiveHotels.push(hotelId);
        }
      });
      return positiveHotels;
    },
  },
};
</script>

<template>
  <!-- Map -->
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
        <g
          class="public_transport"
          v-show="poiStore.selectedPois.includes('public_transport')"
        ></g>
        <g class="markers"></g>
      </g>
    </svg>
    <div class="dummy"></div>
    <!-- Overlays -->
    <div class="map-overlay">
      <v-alert
        class="mb-2 mt-2 instruction text-center elevation-6"
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
      <!-- Header -->
      <v-card class="hotel-header elevation-6" v-if="focusedHotel">
        <div class="d-flex flex-no-wrap justify-space-between">
          <div class="pa-3">
            <v-avatar
              color="#eee"
              :image="`./img/hotels/${city.name
                .replace(' ', '_')
                .toLowerCase()}/${focusedHotel}.png`"
            >
            </v-avatar>
          </div>
          <div class="flex-grow-1">
            <v-card-title>
              {{ hotelMeta[focusedHotel]?.name }}
            </v-card-title>
            <v-card-text>
              Rated
              <v-icon icon="mdi-star" size="x-small" class="inline"></v-icon>
              <strong>{{
                hotelStore.overallRating(focusedHotel).toFixed(1)
              }}</strong>
              according to current priorities
            </v-card-text>
            <v-card-actions>
              <v-btn
                :disabled="hotelIds.indexOf(focusedHotel) === 0"
                @click="
                  focusOnHotel(hotelIds[hotelIds.indexOf(focusedHotel) - 1])
                "
                >Previous</v-btn
              >
              <div class="switch-container">
                <v-switch
                  :model-value="hotelStore.hotelIsSelected(focusedHotel)"
                  color="black"
                  @change="
                    hotelStore.toggleHotelSelection(focusedHotel);
                    updateSelectedHotels();
                    selectionChanged = true;
                  "
                  :label="
                    hotelStore.hotelIsSelected(focusedHotel)
                      ? 'selected'
                      : 'not selected'
                  "
                ></v-switch>
              </div>
              <v-btn
                :disabled="
                  hotelIds.indexOf(focusedHotel) === hotelIds.length - 1
                "
                @click="
                  focusOnHotel(hotelIds[hotelIds.indexOf(focusedHotel) + 1])
                "
                >Next</v-btn
              >
            </v-card-actions>
          </div>
        </div>
      </v-card>
      <div
        class="hotel-details elevation-4"
        v-if="focusedHotel && poiStore.selectedPois.length"
      >
        <v-chip
          v-for="poi in poiStore.selectedPois.filter(
            (poi) => hotelMeta[focusedHotel]?.poiInfo[poi]
          )"
          :key="poi"
          :style="{
            backgroundColor: poiMeta[poi].color,
          }"
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
          <v-icon start :icon="poiMeta[poi].icon"></v-icon>
          <span
            v-html="
              hotelMeta[focusedHotel]?.poiInfo[poi].replace(/^\([+-]\) /, '')
            "
          ></span>
        </v-chip>
      </div>
    </div>
  </div>
  <!-- Paragraph on the selected hotels -->
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
    <InlineListItem
      v-for="(hotelId, index) in hotelStore.selectedHotelIds"
      :key="hotelId"
      :index="index"
      :listLength="hotelStore.selectedHotelIds.length"
    >
      <a @click="focusOnHotel(hotelId)"
        ><strong
          ><v-icon class="inline" icon="mdi-circle" size="x-small"></v-icon>
          {{ hotelMeta[hotelId].name }}</strong
        ></a
      > </InlineListItem
    >.
    <span
      v-if="
        hotelStore.selectedHotelIds.length > 1 &&
        districtsOfSelectedHotels.length > 0
      "
      >They are
      <span v-if="districtsOfSelectedHotels.length === 1"
        >all located in
        <strong
          >{{ this.city.name }} {{ districtsOfSelectedHotels[0] }}</strong
        ></span
      ><span v-else
        >located in <strong>{{ this.city.name + " " }}</strong>
        <span v-if="districtsOfSelectedHotels.length === 2">
          <strong>{{ districtsOfSelectedHotels[0] }}</strong> and
          <strong>{{ districtsOfSelectedHotels[1] }}</strong></span
        ><span v-else
          >{{ districtsOfSelectedHotels.length }} districts</span
        > </span
      >.</span
    >
  </div>
  <!-- Paragraph on the selected POIs -->
  <div
    class="text mt-4"
    v-if="
      hotelStore.selectedHotelIds.length > 1 && poiStore.selectedPois.length > 0
    "
  >
    <span v-if="poisWithAllPositiveScores.length > 0"
      >Regarding
      <InlineListItem
        v-for="(poi, index) in poisWithAllPositiveScores"
        :key="poi"
        :index="index"
        :listLength="poisWithAllPositiveScores.length"
      >
        <PoiChip :poi="poi"></PoiChip></InlineListItem
      >, the selected hotels are all in a favorable location.
    </span>

    <span
      v-if="
        hotelsWithAllPositiveScores.length <
          hotelStore.selectedHotelIds.length &&
        hotelsWithAllPositiveScores.length > 0
      "
    >
      <span v-if="poisWithAllPositiveScores.length > 0">But only </span>
      <InlineListItem
        v-for="(hotel, index) in hotelsWithAllPositiveScores"
        :key="hotel"
        :index="index"
        :listLength="hotelsWithAllPositiveScores.length"
      >
        <a @click="focusOnHotel(hotel)"
          ><strong
            ><v-icon class="inline" icon="mdi-circle" size="x-small"></v-icon>
            {{ hotelMeta[hotel].name }}</strong
          ></a
        >
      </InlineListItem>
      <span v-if="hotelsWithAllPositiveScores.length === 1">
        is in a attractive place</span
      ><span v-else> are in good places</span> for
      <span v-if="poiStore.selectedPois.length > 1"
        >all selected points of interest</span
      ><span v-else><PoiChip :poi="poiStore.selectedPois[0]"></PoiChip></span
      >.</span
    >
  </div>
</template>

<style lang="scss">
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
        &:hover {
          filter: drop-shadow(2px 2px 4px rgba(0, 0, 0, 0.8));
        }
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
      top: -610px;
      width: 100%;
      padding: 0.2rem;
    }

    & .hotel-header {
      background-color: rgba(255, 255, 255, 0.8);
      top: -560px;
      left: 22.5%;
      width: 50%;
      height: 120px;
      & .v-avatar {
        width: 98px !important;
        height: 98px !important;
      }
      & .v-card-text {
        padding-bottom: 0;
      }
      & .switch-container {
        // center all elements
        flex-grow: 1;
        margin-left: 1.5rem;
        & .v-switch {
          max-height: 22px !important;
          position: relative;
          top: -17px;
        }
      }
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

.text {
  & a {
    text-decoration: none;
    cursor: pointer;
    text-decoration: underline;
    &:hover {
      background-color: rgba(0, 0, 0, 0.05);
    }
  }
  & .v-chip {
    display: relative;
    top: -2px;
  }
}

.v-icon.inline {
  display: relative;
  top: -2px;
}
</style>