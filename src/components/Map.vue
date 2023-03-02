<script>
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
  data() {
    return {
      zoom: 13,
      center: [0, 0],
      // TODO: avoid using separate marker objects, but use hotels instead
      markers: [],
      bounds: [
        [0, 0],
        [0, 0],
      ],
    };
  },
  mounted() {
    this.hotelStore.$onAction(({ name, after }) => {
      after(() => {
        if (name === "loadHotels") {
          this.setMapCenter();
        }
      });
    });
  },
  methods: {
    async setMapCenter() {
      await import("leaflet").then(async (L) => {
        // set markers on map
        this.hotelStore.hotels.forEach((hotel) => {
          const marker = L.marker([hotel.lat, hotel.long]);
          this.markers.push(marker);
        });

        // set center to first marker
        this.center = this.markers[0]._latlng;

        // set center to average of all markers
        this.center.lat =
          this.markers.map((x) => x._latlng.lat).reduce((a, b) => a + b) /
          this.markers.length;
        this.center.lng =
          this.markers.map((x) => x._latlng.lng).reduce((a, b) => a + b) /
          this.markers.length;

        // set zoom level to include all markers
        this.bounds = L.latLngBounds(this.markers.map((x) => x._latlng));
        this.$nextTick(() => {
          //const map = this.$refs.map.mapObject; //TODO doesn't select map, mapObject is undefined
          console.log(this.map);
          //this.zoom = this.map.getBoundsZoom(this.bounds); //TODO doesn't work, not a function
        });
      });
    },
  },
};
</script>

<template>
  <div class="ml-12 instruction">
    Please click a marker to select/deselect a hotel.
  </div>
  <div class="map">
    <l-map
      ref="map"
      :center="center"
      :zoom="zoom"
      :minZoom="zoom"
      :maxZoom="zoom"
      :bounds="bounds"
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
          (hotel) => hotel.lat && hotel.long
        )"
        :key="index"
        :lat-lng="[hotel.lat, hotel.long]"
        @click="hotel.isSelected = !hotel.isSelected"
      >
        <l-tooltip>{{ hotel.name }}</l-tooltip>
        <l-icon
          :icon-url="
            hotel.isSelected
              ? 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png'
              : 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-grey.png'
          "
        ></l-icon>
      </l-marker>
    </l-map>
  </div>
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