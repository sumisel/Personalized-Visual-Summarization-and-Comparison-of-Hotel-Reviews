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
      hotelStore
    };
  },
};
</script>

<template>
  <div>Among the available <strong>{{ hotelStore.hotels.length }}</strong> hotels, 
    <span v-if="hotelStore.selectedHotels.length > 1"  ><strong>{{ hotelStore.selectedHotels.length }}</strong>  are</span>
    <span v-if="hotelStore.selectedHotels.length === 1" >only <strong>1</strong> is</span>
    <span v-if="hotelStore.selectedHotels.length === 0" ><strong>none</strong> is</span>
     selected.</div>
  <div class="ml-12 mt-4 instruction">
    Please click a marker to select/deselect a hotel.
    <strong v-if="hotelStore.selectedHotels.length < 2">Select more than one hotel to compare.</strong>
  </div>
  <div class="map">
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
          (hotel) => hotel.location.lat && hotel.location.long
        )"
        :key="index"
        :lat-lng="[hotel.location.lat, hotel.location.long]"
        @click="hotel.isSelected = hotel.isSelected? 0 :
                                                      hotelStore.selectedHotels.reduce( // set to highest index plus 1
                                                       (max, hotel) => (max = Math.max(max, hotel.isSelected)),0) + 1"
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