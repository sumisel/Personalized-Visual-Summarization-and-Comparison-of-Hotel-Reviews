<script setup>
import { ref } from "vue";

import "leaflet/dist/leaflet.css";
import { LMap, LTileLayer, LMarker } from "@vue-leaflet/vue-leaflet";
</script>

<template>
  <div class="map">
    <l-map
      ref="map"
      :center="[35.512986, -98.975897]"
      :zoom="14"
      :minZoom="14"
      :maxZoom="14"
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
      <l-marker :lat-lng="[35.512986, -98.975897]"></l-marker>
      <l-marker :lat-lng="[35.521976, -98.978897]"></l-marker>
      <l-marker :lat-lng="[35.510986, -98.979897]"></l-marker>
    </l-map>
  </div>
  <div class="dummy"></div>
</template>

<style scoped>
.map {
  height: 600px;
  width: calc(100vw - 344px);
  left: 0;
  position: absolute;
}
.dummy {
  height: 600px;
}
</style>