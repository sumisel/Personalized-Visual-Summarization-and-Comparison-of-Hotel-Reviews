<script>
import * as d3 from "d3";

import { inject, ref } from "vue";

import { useHotelStore } from "@/stores/hotel";
import { usePoiStore } from "@/stores/poi";
import { useCategoryStore } from "../stores/category";

import InlineListItem from "./InlineListItem.vue";
import PoiChip from "./PoiChip.vue";
import Instruction from "./Instruction.vue";
import HotelName from "./HotelName.vue";
import HotelAvatarInline from "./HotelAvatarInline.vue";

const MARKER_RADIUS = 15;
const TRANSITION_DURATION = 750;
const MARKER_LABEL_BG_OPACITY = 0.3;

export default {
  components: {
    HotelAvatarInline,
    InlineListItem,
    PoiChip,
    Instruction,
    HotelName,
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
        .attr("r", MARKER_RADIUS);
      d3.selectAll("#svg-map .markers-labels rect")
        .transition()
        .duration(TRANSITION_DURATION)
        .attr("opacity", MARKER_LABEL_BG_OPACITY);
      d3.selectAll("#svg-map .markers-labels text")
        .transition()
        .duration(TRANSITION_DURATION)
        .attr("opacity", 1);
      d3.selectAll("#svg-map .markers-annotations g")
        .transition()
        .duration(TRANSITION_DURATION)
        .attr("opacity", 1);
    },
    focusOnHotel(hotelId) {
      if (this.focusedHotel === hotelId) {
        this.resetZoom();
        return;
      }
      this.inZooming = true;
      d3.select("#svg-map .controls g")
        .attr("visibility", "hidden");
      this.scrollToMap();
      this.focusedHotel = null;
      this.resetAllMarkers();
      d3.select(`#svg-map .markers circle[id="${hotelId}"]`)
        .transition()
        .duration(TRANSITION_DURATION)
        .attr("r", 60 * this.city.scale / 500000)
        .attr("opacity", 0.5);
      d3.selectAll("#svg-map .markers-labels rect")
        .transition()
        .duration(TRANSITION_DURATION)
        .attr("opacity", 0);
      d3.selectAll("#svg-map .markers-labels text")
        .transition()
        .duration(TRANSITION_DURATION)
        .attr("opacity", 0);
      d3.selectAll("#svg-map .markers-annotations g")
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
      const k = 2 * 500000 / this.city.scale;
      svg
        .select(".map-container")
        .transition()
        .duration(TRANSITION_DURATION)
        .attr(
          "transform",
          `translate(${this.width / 2}, ${this.height / 2
          }) scale(${k}) translate(${-x}, ${-y})`
        );
      // set focused hotel after transition duration
      setTimeout(() => {
        this.focusedHotel = hotelId;
        this.inZooming = false;
      }, TRANSITION_DURATION);
    },
    resetZoom() {
      if (!this.focusedHotel) return;
      this.focusedHotel = "";
      this.resetAllMarkers();
      d3.select("#svg-map")
        .select(".map-container")
        .transition()
        .duration(TRANSITION_DURATION)
        .attr("transform", "");
      // wait first transition phase to finish
      setTimeout(() => {
        d3.selectAll("#svg-map .markers circle")
          .transition()
          .duration(TRANSITION_DURATION)
          .attr("opacity", 1);
      }, TRANSITION_DURATION);
    },
    updateSelectedHotels() {
      d3.select("#svg-map")
        .select(".markers")
        .selectAll("circle")
        .attr("fill", (d) =>
          this.hotelStore.hotelIsSelected(d.id) ? "black" : "white"
        );
    },
    updateRatings() {
      d3.select("#svg-map .markers-labels")
        .selectAll("g")
        .data(
          Object.entries(this.hotelMeta).map(([id, meta]) => ({
            id,
            rating: this.hotelStore.overallRating(id).toFixed(1),
            location: meta.location,
          }))
        )
        .join("g")
        .select("text")
        .text((d) => d.rating);
    },
    updatePoiMarkers() {
      // draw POI circles as annontations for each hotel marker
      const positivePoisPerHotel = Object.entries(this.hotelMeta).map(
        ([id, meta]) => ({
          id: id,
          location: meta.location,
          postivePois: this.poiStore.selectedPois.filter((poi) =>
            meta.poiInfo?.[poi]?.startsWith("(+)")
          ),
        })
      );
      const annotationGroups = d3
        .select("#svg-map .markers-annotations")
        .selectAll("g")
        .data(positivePoisPerHotel)
        .join("g")
        .attr("id", (d) => d.id)
        .attr("transform", (d) => {
          const x = this.projection([d.location.long, d.location.lat])[0];
          const y = this.projection([d.location.long, d.location.lat])[1];
          return `translate(${x}, ${y})`;
        });
      annotationGroups
        .selectAll("circle")
        .data((d) =>
          d.postivePois
            .map((poi) => ({
              poi: poi,
              length: d.postivePois.length,
            }))
            .reverse()
        )
        .join("circle")
        .attr("cx", (d, i) => -1 * (i * 6 - (d.length - 1) * 3))
        .attr("cy", 0)
        .attr("r", 5)
        .attr("fill", (d) => this.poiMeta[d.poi].color)
        .attr("stroke", (d) => d3.color(this.poiMeta[d.poi].color).darker());
    },
    scrollToMap() {
      const mapOffsetTop = document.getElementById("svg-map").parentElement.offsetTop;
      window.scrollTo(
        {
          top: mapOffsetTop - 120,
          behavior: "smooth",
        }
      );
    },
    printNumber(number) {
      // use number words for numbers <= 12
      if (number === 0) return "none";
      if (number === 1) return "one";
      if (number === 2) return "two";
      if (number === 3) return "three";
      if (number === 4) return "four";
      if (number === 5) return "five";
      if (number === 6) return "six";
      if (number === 7) return "seven";
      if (number === 8) return "eight";
      if (number === 9) return "nine";
      if (number === 10) return "ten";
      if (number === 11) return "eleven";
      if (number === 12) return "twelve";
      // else
      return number.toLocaleString("en-US");
    },
  },
  mounted() {
    this.categoryStore.$subscribe(() => {
      this.updateRatings();
    });

    this.poiStore.$subscribe(() => {
      this.updatePoiMarkers();
    });

    const cityId = this.city.name.replace(" ", "_").toLowerCase();

    this.width = d3.select("#app").node().getBoundingClientRect().width - 344;
    this.height = 600;
    const svg = d3
      .select("#svg-map")
      .attr("width", this.width)
      .attr("height", this.height)
      .on("click", this.resetZoom)
      .on("mousemove", (event) => {
        // blend out controls if too far from controls position
        const distance = Math.sqrt(
          Math.pow(event.offsetX - this.controlsPosition?.[0], 2) +
          Math.pow(event.offsetY - this.controlsPosition?.[1], 2)
        );
        if (distance > 110) {
          d3.select("#svg-map .controls g")
            .attr("visibility", "hidden");
        }
      })

    this.projection = d3
      .geoMercator()
      .scale(this.city.scale)
      .center([this.city.center[1], this.city.center[0]])
      .translate([this.width / 2, this.height / 2]);

    // draw water
    d3.json(`./geo/water_${cityId}.geojson`).then((geojson) => {
      var linesOnly = geojson.features.filter(function (feature) {
        return feature.geometry?.type === "LineString";
      });
      const path = d3.geoPath().projection(this.projection);
      svg
        .select(".water")
        .selectAll("path")
        .data(geojson.features)
        .enter()
        .append("path")
        .attr("d", path)
        .attr("fill", cityId === "new_york" ? "#dff8fa" : "none")
        .style("stroke", "#dff8fa")
        .style("stroke-width", cityId === "new_york" ? "0" : "12px");
    });

    // draw roads
    d3.json(`./geo/roads_${cityId}.geojson`).then((geojson) => {
      var linesOnly = geojson.features.filter(function (feature) {
        return feature.geometry?.type === "LineString";
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
    if (this.city.landmarks?.length > 0) {
      svg
        .select(".landmarks")
        .selectAll("image")
        .data(this.city.landmarks)
        .enter()
        .append("image")
        .attr(
          "xlink:href",
          (d) =>
            `./img/landmarks/${this.city.name
              .replace(" ", "_")
              .toLowerCase()}/${d.id}.png`
        )
        .attr(
          "x",
          (d) =>
            this.projection([d.location[1], d.location[0]])[0] -
            30 * (d.scale ? d.scale : 1)
        )
        .attr(
          "y",
          (d) =>
            this.projection([d.location[1], d.location[0]])[1] -
            45 * (d.scale ? d.scale : 1)
        )
        .attr("width", (d) => 60 * (d.scale ? d.scale : 1))
        .attr("height", (d) => 60 * (d.scale ? d.scale : 1))
        .attr("opacity", 0.5);
    }

    // draw parks
    d3.json(`./geo/parks_${cityId}.geojson`).then((geojson) => {
      const path = d3.geoPath().projection(this.projection);
      svg
        .select(".parks")
        .selectAll("path")
        .data(geojson.features)
        .enter()
        .append("path")
        .attr("d", path)
        .attr("fill", this.poiMeta.parks.color);
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
        .attr("d", path)
        .style("fill", this.poiMeta.sightseeing.color);
    });

    // draw restaurants
    d3.json(`./geo/restaurants_${cityId}.geojson`).then((geojson) => {
      var pointsOnly = geojson.features.filter(function (feature) {
        return feature.geometry?.type === "Point";
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

    // draw shopping
    d3.json(`./geo/shopping_${cityId}.geojson`).then((geojson) => {
      var pointsOnly = geojson.features.filter(function (feature) {
        return feature.geometry?.type === "Point";
      });
      const path = d3.geoPath().projection(this.projection);
      svg
        .select(".shopping")
        .selectAll("path")
        .data(pointsOnly)
        .enter()
        .append("path")
        .attr("fill", this.poiMeta.shopping.color)
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
      .attr("r", MARKER_RADIUS)
      .attr("stroke", "black")
      .attr("stroke-width", "2px")
      .on("click", (event, d) => {
        this.hotelStore.toggleHotelSelection(d.id);
        this.updateSelectedHotels();
        this.selectionChanged = true;
        event.stopPropagation();
      })
      .on("mouseover", (event, d) => {
        if (this.focusedHotel || this.inZooming) return;
        this.controlsPosition = this.projection([d.location.long, d.location.lat]);
        d3.select("#svg-map .controls g")
          .attr("transform", `translate(${this.controlsPosition[0] + 25}, ${this.controlsPosition[1] + 5})`)
          .attr("visibility", "visible")
          .data([d])
          .on("click", (event, d) => {
            this.focusOnHotel(d.id);
            event.stopPropagation();
          })
        event.stopPropagation();
      });

    // TODO: replace with v-tooltip
    markers.append("title").text((d) => `${d.name}`);

    // marker labels
    const labelGroup = d3.select("#svg-map .markers-labels")
      .selectAll("g")
      .data(
        Object.entries(this.hotelMeta).map(([id, meta]) => ({
          id,
          rating: this.hotelStore.overallRating(id).toFixed(1),
          location: meta.location,
        }))
      )
      .join("g")
      .attr("id", (d) => d.id)
      .attr("transform", (d) => {
        const [x, y] = this.projection([
          d.location.long,
          d.location.lat,
        ]);
        return `translate(${x}, ${y - MARKER_RADIUS - 6})`;
      });

    // controls
    const controls = d3.select("#svg-map .controls")
      .append("g")
      .attr("visibility", "hidden");
    controls.append("rect")
      .attr("x", 0)
      .attr("y", -15)
      .attr("width", 80)
      .attr("height", 20)
      .attr("fill", "white")
    controls.append("text")
      .attr("x", 40)
      .attr("y", 0)
      .attr("text-anchor", "middle")
      .attr("alignment-baseline", "middle")
      .text("ZOOM IN");

    labelGroup.append("rect")
      .attr("x", -MARKER_RADIUS)
      .attr("y", -MARKER_RADIUS)
      .attr("width", 2 * MARKER_RADIUS)
      .attr("height", 20)
      .attr("fill", "white")
      .attr("opacity", MARKER_LABEL_BG_OPACITY);

    labelGroup.append("text")
      .attr("text-anchor", "middle")
      .attr("alignment-baseline", "middle")
      .attr("font-size", "14px")
      .attr("font-weight", "bold");

    this.updateSelectedHotels();
    this.updateRatings();
    this.updatePoiMarkers();
  },
  computed: {
    poisWithAllPositiveScores() {
      const positivePois = [];
      this.poiStore.selectedPois.forEach((poi) => {
        let positive = true;
        this.hotelStore.selectedHotelIds.forEach((hotelId) => {
          if (!this.hotelMeta[hotelId].poiInfo?.[poi]?.startsWith("(+)")) {
            positive = false;
          }
        });
        if (positive) {
          positivePois.push(poi);
        }
      });
      return positivePois;
    },
    selectedHotelsWithAllPositiveScores() {
      const positiveHotels = [];
      this.hotelStore.selectedHotelIdsSortedByRating.forEach((hotelId) => {
        let positive = true;
        this.poiStore.selectedPois.forEach((poi) => {
          if (!this.hotelMeta[hotelId].poiInfo?.[poi]?.startsWith("(+)")) {
            positive = false;
          }
        });
        if (positive) {
          positiveHotels.push(hotelId);
        }
      });
      return positiveHotels;
    },
    nonSelectedHotelsWithAllPositiveScores() {
      const positiveHotels = [];
      Object.keys(this.hotelMeta).forEach((hotelId) => {
        let positive = true;
        this.poiStore.selectedPois.forEach((poi) => {
          if (!this.hotelMeta[hotelId].poiInfo?.[poi]?.startsWith("(+)")) {
            positive = false;
          }
        });
        if (positive && !this.hotelStore.hotelIsSelected(hotelId)) {
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
    poiDarkerColor(poi) {
      return (poi) => d3.color(this.poiMeta[poi].color).darker();
    },
    poiLighterColor(poi) {
      return (poi) => d3.interpolateRgb(this.poiMeta[poi].color, "white")(0.7);
    },
  },
};
</script>

<template>
  <!-- Instructions -->
  <Instruction v-if="!selectionChanged ||
    poiStore.selectedPois.length === 0
    " headerInstruction>
    <ul>
      <li v-if="poiStore.selectedPois.length === 0">
        <v-icon icon="mdi-arrow-left" class="inline"></v-icon> Choose your favorite points of interests, to see related
        information.
      </li>
      <li v-if="!selectionChanged"><v-icon icon="mdi-arrow-down" class="inline"></v-icon> Click a circle to select a
        hotel.
      </li>
    </ul>
  </Instruction>
  <!-- Map -->
  <div class="map-container">
    <svg id="svg-map" class="map">
      <g class="map-container">
        <g class="water"></g>
        <g class="roads"></g>
        <g class="parks" v-show="poiStore.selectedPois.includes('parks')"></g>
        <g class="sightseeing" v-show="poiStore.selectedPois.includes('sightseeing')"></g>
        <g class="shopping" v-show="poiStore.selectedPois.includes('shopping')"></g>
        <g class="restaurants" v-show="poiStore.selectedPois.includes('restaurants')"></g>
        <g class="public_transport" v-show="poiStore.selectedPois.includes('public_transport')"></g>
        <g class="landmarks"></g>
        <g class="markers"></g>
        <g class="markers-annotations"></g>
        <g class="markers-labels"></g>
        <g class="controls"></g>
      </g>
    </svg>
    <div class="dummy"></div>
    <!-- Overlays -->
    <div class="map-overlay">
      <!-- Header -->
      <v-card class="hotel-header elevation-6" v-if="focusedHotel">
        <v-btn density="compact" icon="mdi-close" @click="resetZoom" class="close-button"></v-btn>
        <div class="d-flex flex-no-wrap justify-space-between">
          <div class="pa-3">
            <v-avatar color="#eee" :image="`./img/hotels/${city.name
              .replace(' ', '_')
              .toLowerCase()}/${focusedHotel=='Hotel_Review-g187147-d197610-Reviews-Paris_Marriott_Rive_Gauche_Hotel_Conference_Center-Paris_Ile_de_France.html'?'Hotel_Review-g187147-d197610-Reviews-Paris_Marriott_Rive_Gauche_Hotel_Conference_Center-Paris_Ile_de_':focusedHotel}.png`">
            </v-avatar>
          </div>
          <div class="flex-grow-1">
            <v-card-title>
              <HotelName :hotelId="focusedHotel" :selected="hotelStore.hotelIsSelected(focusedHotel)"></HotelName>
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
              <v-btn :disabled="previousHotelId === null" @click="focusOnHotel(previousHotelId)">
                <v-icon icon="mdi-arrow-left"></v-icon><v-tooltip activator="parent" location="bottom">Next hotel to the
                  west</v-tooltip></v-btn>
              <div class="switch-container">
                <v-switch :model-value="hotelStore.hotelIsSelected(focusedHotel)" color="black" @change="
                  hotelStore.toggleHotelSelection(focusedHotel);
                updateSelectedHotels();
                selectionChanged = true;
                " :label="hotelStore.hotelIsSelected(focusedHotel)
  ? 'selected'
  : 'not selected'
  "></v-switch>
              </div>
              <v-btn :disabled="nextHotelId === null" @click="focusOnHotel(nextHotelId)"><v-icon
                  icon="mdi-arrow-right"></v-icon><v-tooltip activator="parent" location="bottom">Next hotel to the
                  east</v-tooltip>
              </v-btn>
            </v-card-actions>
          </div>
        </div>
      </v-card>
      <!-- Legend -->
      <div class="legend focused" v-if="focusedHotel">500 m radius</div>
      <div class="legend non-focused" v-else>
        <div class="bar" :style="`width: ${60 * this.city.scale / 500000}px;`"></div>
        <div>500 m</div>
      </div>
      <!-- POI details-->
      <div class="hotel-details" v-if="focusedHotel && poiStore.selectedPois.length">
        <v-chip v-for="poi in poiStore.selectedPois.filter(
          (poi) => hotelMeta[focusedHotel]?.poiInfo?.[poi]
        )" :key="poi" :style="{
  backgroundColor: hotelMeta[focusedHotel]?.poiInfo?.[poi].startsWith(
    '(+)'
  )
    ? poiMeta[poi].color
    : hotelMeta[focusedHotel]?.poiInfo[poi].startsWith('(-)')
      ? 'white'
      : poiLighterColor(poi),
  borderColor: poiDarkerColor(poi),
  borderWidth: '2px',
}" class="elevation-6">
          <v-icon start :icon="hotelMeta[focusedHotel]?.poiInfo[poi].startsWith('(+)')
            ? 'mdi-plus'
            : hotelMeta[focusedHotel]?.poiInfo[poi].startsWith('(-)')
              ? 'mdi-minus'
              : 'mdi-plus-minus'
            "></v-icon>
          <v-icon start :icon="poiMeta[poi].icon"></v-icon>
          <span v-html="hotelMeta[focusedHotel]?.poiInfo[poi].replace(/^\([+-]\) /, '')
            "></span>
        </v-chip>
      </div>
    </div>
  </div>
  <!-- Paragraph on the selected hotels -->
  <div class="text mt-4">
    Among the available
    <strong>{{ printNumber(Object.keys(hotelMeta).length) }}</strong> hotels
    <v-icon class="inline" icon="mdi-circle-outline" size="x-small"></v-icon>,
    <span v-if="hotelStore.selectedHotelIds.length > 1"><strong>{{ printNumber(hotelStore.selectedHotelIds.length)
    }}</strong>
      are</span>
    <span v-if="hotelStore.selectedHotelIds.length === 1">only <strong>one</strong> is</span>
    <span v-if="hotelStore.selectedHotelIds.length === 0"><strong>none</strong> are</span>
    selected <v-icon class="inline" icon="mdi-circle" size="x-small"></v-icon><span
      v-if="hotelStore.selectedHotelIds.length > 0">: </span><span v-else></span>
    <InlineListItem v-for="(hotelId, index) in hotelStore.selectedHotelIdsSortedByRating" :key="hotelId" :index="index"
      :listLength="hotelStore.selectedHotelIds.length">
      <a @click="focusOnHotel(hotelId)"><strong>
          <HotelAvatarInline :hotelId="hotelId"></HotelAvatarInline>
          {{ hotelMeta[hotelId].name }}
        </strong></a>
    </InlineListItem>.
    <v-btn variant="plain" prepend-icon="mdi-close" v-if="hotelStore.selectedHotelIds.length > 0"
      @click="hotelStore.clearSelection(); updateSelectedHotels();">Clear selection</v-btn>
  </div>
  <!-- Paragraph on the selected POIs -->
  <div class="text mt-4" v-if="hotelStore.selectedHotelIds.length > 1 && poiStore.selectedPois.length > 0
    ">
    <span v-if="poisWithAllPositiveScores.length > 0">Regarding
      <InlineListItem v-for="(poi, index) in poisWithAllPositiveScores" :key="poi" :index="index"
        :listLength="poisWithAllPositiveScores.length">
        <PoiChip :poi="poi"></PoiChip>
      </InlineListItem>, the selected hotels are all in a favorable location.
    </span>
    <span v-if="selectedHotelsWithAllPositiveScores.length <
      hotelStore.selectedHotelIds.length &&
      selectedHotelsWithAllPositiveScores.length > 0
      ">
      <span v-if="poisWithAllPositiveScores.length > 0">But only </span>
      <InlineListItem v-for="(hotel, index) in selectedHotelsWithAllPositiveScores" :key="hotel" :index="index"
        :listLength="selectedHotelsWithAllPositiveScores.length">
        <a @click="focusOnHotel(hotel)"><strong><v-icon class="inline" icon="mdi-circle" size="x-small"></v-icon>
            {{ hotelMeta[hotel].name }}</strong></a>
      </InlineListItem>
      <span v-if="selectedHotelsWithAllPositiveScores.length === 1">
        is in an attractive place</span><span v-else> are in good places</span> for
      <span v-if="poiStore.selectedPois.length > 1">all selected points of interest</span><span v-else>
        <PoiChip :poi="poiStore.selectedPois[0]"></PoiChip>
      </span>.
    </span>
    <span v-if="selectedHotelsWithAllPositiveScores.length === 0">
      <span>None of the selected hotels is in a favorable location for all the selected points of
        interest.</span>
    </span>
  </div>
  <!-- Paragraph on the non-selected hotels with favorable POIs -->
  <div class="text mt-4"
    v-if="this.poiStore.selectedPois.length > 0 && nonSelectedHotelsWithAllPositiveScores.length > 0"><span
      v-if="selectedHotelsWithAllPositiveScores.length === 0">However, </span><span v-else>Additionally, </span><span
      v-if="nonSelectedHotelsWithAllPositiveScores.length > 1">hotels that match </span><span v-else>a hotel that matches
    </span>the current selection of points of interests would be
    <InlineListItem v-for="(hotel, index) in nonSelectedHotelsWithAllPositiveScores" :key="hotel" :index="index"
      :listLength="nonSelectedHotelsWithAllPositiveScores.length">
      <a @click="focusOnHotel(hotel)"><strong><v-icon class="inline" icon="mdi-circle-outline" size="x-small"></v-icon>
          {{ hotelMeta[hotel].name }}</strong></a>
    </InlineListItem>. <v-btn variant="plain" prepend-icon="mdi-map-marker-plus"
      @click="hotelStore.selectedHotelIds = hotelStore.selectedHotelIds.concat(nonSelectedHotelsWithAllPositiveScores); updateSelectedHotels();">Add
      to selection</v-btn>
  </div>
</template>

<style lang="scss">
@import "@/styles/global.scss";

.map-container {
  & .map {
    height: 600px;
    width: calc(100vw - 344px);
    left: 344px;
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

    & .markers-annotations {
      & circle {
        pointer-events: none;
      }
    }

    & .markers-labels {
      & g {
        pointer-events: none;
        filter: drop-shadow(0px 0px 1px white);
      }
    }

    & .controls g {
      cursor: pointer;
      font-size: 0.9rem;

      &:hover rect {
        fill: #eee;
      }
    }
  }

  & .dummy {
    height: 600px;
  }

  & .map-overlay {
    position: relative;

    &>div {
      position: absolute;
    }

    & .hotel-header {
      background-color: rgba(255, 255, 255, 0.8);
      top: -560px;
      left: 22.5%;
      width: 50%;
      height: 120px;

      & .close-button {
        position: absolute;
        top: 0.5rem;
        right: 0.5rem;
        z-index: 1;
      }

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

    & .legend {
      padding: 0.25rem;
      background-color: rgba(255, 255, 255, 0.5);
      @include explanation;

      &.focused {
        top: -200px;
        left: 58%;
      }

      &.non-focused {
        top: -30px;
        left: 90%;
        text-align: right;

        & .bar {
          background-color: rgba(0,0,0,0.5);
          height: 4px;
        }
      }
    }

    & .hotel-details {
      // transparent
      background-color: rgba(255, 255, 255, 0);
      top: -160px;
      left: 12.5%;
      width: 70%;
      // center contained elements
      display: flex;
      justify-content: center;
      align-items: center;
      flex-wrap: wrap;

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
}</style>