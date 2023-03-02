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
import { useCityStore } from "@/stores/city.js";

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
    const cityStore = useCityStore();

    return {
      map,
      hotelStore,
      cityStore
    };
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
      :center="cityStore.city.center"
      :zoom="cityStore.city.zoom"
      :minZoom="cityStore.city.zoom"
      :maxZoom="cityStore.city.zoom"
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