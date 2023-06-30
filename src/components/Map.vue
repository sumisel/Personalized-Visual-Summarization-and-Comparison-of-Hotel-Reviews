<script>
import * as d3 from "d3";

import { inject, ref } from "vue";

import { useHotelStore } from "@/stores/hotel";
import { usePoiStore } from "@/stores/poi";
import { useCategoryStore } from "../stores/category";

import InlineListItem from "./InlineListItem.vue";
import PoiChip from "./PoiChip.vue";
import Instruction from "./Instruction.vue";

const TRANSITION_DURATION = 750;

export default {
  components: {
    InlineListItem,
    PoiChip,
    Instruction,
  },
  setup() {
    const map = ref();
    const hotelStore = useHotelStore();
    const poiStore = usePoiStore();
    const categoryStore = useCategoryStore();
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
      categoryStore,
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
        .transition()
        .duration(TRANSITION_DURATION)
        .attr("opacity", 1)
        .attr("r", 10);
      d3.select("#svg-map")
        .select(".markers-labels")
        .selectAll("text")
        .transition()
        .duration(TRANSITION_DURATION)
        .attr("opacity", 1);
    },
    focusOnHotel(hotelId) {
      if (this.focusedHotel === hotelId) {
        this.resetZoom();
        return;
      }
      this.focusedHotel = null;
      this.resetAllMarkers();
      d3.select(`#svg-map .markers circle[id="${hotelId}"]`)
        .transition()
        .duration(TRANSITION_DURATION)
        .attr("r", 60)
        .attr("opacity", 0.5);
      d3.select(`#svg-map .markers-labels text[id="${hotelId}"]`)
        .transition()
        .duration(TRANSITION_DURATION)
        .attr("opacity", 0);
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
        .duration(TRANSITION_DURATION)
        .attr(
          "transform",
          `translate(${this.width / 2}, ${
            this.height / 2
          }) scale(${k}) translate(${-x}, ${-y})`
        );
      // set focused hotel after transition duration
      setTimeout(() => {
        this.focusedHotel = hotelId;
      }, TRANSITION_DURATION);
    },
    resetZoom() {
      this.resetAllMarkers();
      d3.select("#svg-map")
        .select(".map-container")
        .transition()
        .duration(TRANSITION_DURATION)
        .attr("transform", "");
      this.focusedHotel = "";
    },
    updateSelectedHotels() {
      d3.select("#svg-map")
        .select(".markers")
        .selectAll("circle")
        .transition()
        .duration(TRANSITION_DURATION)
        .attr("fill", (d) =>
          this.hotelStore.hotelIsSelected(d.id) ? "black" : "white"
        );
    },
    updateRatings() {
      d3.select("#svg-map .markers-labels")
        .selectAll("text")
        .data(
          Object.entries(this.hotelMeta).map(([id, meta]) => ({
            id,
            rating: this.hotelStore.overallRating(id).toFixed(1),
            location: meta.location,
          }))
        )
        .join("text")
        .attr("id", (d) => d.id)
        .attr("x", (d) => this.projection([d.location.long, d.location.lat])[0])
        .attr(
          "y",
          (d) => this.projection([d.location.long, d.location.lat])[1] - 15
        )
        .attr("text-anchor", "middle")
        .attr("alignment-baseline", "middle")
        .attr("font-size", "12px")
        .attr("fill", "black")
        .text((d) => d.rating);
    },
  },
  mounted() {
    this.categoryStore.$subscribe(() => {
      this.updateRatings();
    });

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

    // draw landmarks as png images as stored in "city.landmarks"
    svg
      .select(".landmarks")
      .selectAll("image")
      .data(this.city.landmarks)
      .enter()
      .append("image")
      .attr(
        "xlink:href",
        (d) =>
          `./img/landmarks/${this.city.name.replace(" ", "_").toLowerCase()}/${
            d.id
          }.png`
      )
      .attr("x", (d) => this.projection([d.location[1], d.location[0]])[0] - 30)
      .attr("y", (d) => this.projection([d.location[1], d.location[0]])[1] - 20)
      .attr("width", 60)
      .attr("height", 60)
      .attr("opacity", 0.5);

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

    // TODO: replace with v-tooltip
    markers.append("title").text((d) => `${d.name}`);

    this.updateSelectedHotels();
    this.updateRatings();
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
    previousHotelId() {
      const longitude = this.hotelMeta[this.focusedHotel].location.long;
      let previousLongitude = -Infinity;
      let previousHotelId = null;
      Object.keys(this.hotelMeta).forEach((hotelId) => {
        if (
          this.hotelMeta[hotelId].location.long < longitude &&
          this.hotelMeta[hotelId].location.long > previousLongitude
        ) {
          previousLongitude = this.hotelMeta[hotelId].location.long;
          previousHotelId = hotelId;
        }
      });
      return previousHotelId;
    },
    nextHotelId() {
      const longitude = this.hotelMeta[this.focusedHotel].location.long;
      let nextLongitude = Infinity;
      let nextHotelId = null;
      Object.keys(this.hotelMeta).forEach((hotelId) => {
        if (
          this.hotelMeta[hotelId].location.long > longitude &&
          this.hotelMeta[hotelId].location.long < nextLongitude
        ) {
          nextLongitude = this.hotelMeta[hotelId].location.long;
          nextHotelId = hotelId;
        }
      });
      return nextHotelId;
    },
  },
};
</script>

<template>
  <!-- Instructions -->
  <Instruction
    v-if="
      !selectionChanged ||
      hotelStore.selectedHotelIds.length < 2 ||
      poiStore.selectedPois.length === 0
    "
  >
    <span v-if="!selectionChanged"
      >Click a marker to focus a hotel, and then (de)select it using the switch.
    </span>
    <strong v-if="hotelStore.selectedHotelIds.length < 2"
      >Select multiple hotels to compare.
    </strong>
    <strong v-if="poiStore.selectedPois.length === 0"
      >Choose your favorite points of interests, to see related information.
    </strong>
  </Instruction>
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
        <g class="landmarks"></g>
        <g class="markers"></g>
        <g class="markers-labels"></g>
      </g>
    </svg>
    <div class="dummy"></div>
    <!-- Overlays -->
    <div class="map-overlay">
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
            <v-card-title
              :style="{
                'font-weight': hotelStore.hotelIsSelected(focusedHotel)
                  ? 'bold'
                  : 'normal',
              }"
            >
              {{ hotelMeta[focusedHotel]?.name }}
            </v-card-title>
            <v-card-text>
              Rated
              <v-icon icon="mdi-star" size="x-small" class="inline"></v-icon>
              <strong>{{
                hotelStore.overallRating(focusedHotel).toFixed(1)
              }}</strong>
              (of 5) according to current priorities
            </v-card-text>
            <v-card-actions>
              <v-btn
                :disabled="previousHotelId === null"
                @click="focusOnHotel(previousHotelId)"
              >
                <v-icon icon="mdi-arrow-left"></v-icon
                ><v-tooltip activator="parent" location="bottom"
                  >Next hotel to the west</v-tooltip
                ></v-btn
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
                :disabled="nextHotelId === null"
                @click="focusOnHotel(nextHotelId)"
                ><v-icon icon="mdi-arrow-right"></v-icon
                ><v-tooltip activator="parent" location="bottom"
                  >Next hotel to the east</v-tooltip
                >
              </v-btn>
            </v-card-actions>
          </div>
        </div>
      </v-card>
      <!-- POI details -->
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
            opacity: hotelMeta[focusedHotel]?.poiInfo[poi].startsWith('(+)')
              ? 1
              : hotelMeta[focusedHotel]?.poiInfo[poi].startsWith('(-)')
              ? 0.5
              : 0.7,
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
    selected<span v-if="hotelStore.selectedHotelIds.length > 0">: </span
    ><span v-else></span>
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
        flex-grow: 1;
        margin-left: 2.5rem;
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