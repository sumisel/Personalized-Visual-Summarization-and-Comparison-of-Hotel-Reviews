<script>
import {onMounted, ref} from "vue";

import "leaflet/dist/leaflet.css";
import { LMap, LTileLayer, LMarker } from "@vue-leaflet/vue-leaflet";
import {useHotelStore} from "@/stores/hotel";


export default {
  components: {
    LMap,
    LTileLayer,
    LMarker},
  data() {
    return {
      zoom: 13,
      center: [0, 0],
      markers: [],
      bounds: [[0, 0], [0, 0]],
    }
  },
  mounted() {
    this.setMarkers();
  },
  methods: {
    async setMarkers() {
      await import('leaflet').then(async L => {
        console.log(L);
        await useHotelStore().getLocations().then(locations => {
          console.log(locations);
          // set markers on map
          locations.forEach(hotel => {
            const marker = L.marker([hotel["lat"], hotel["long"]])
            //const marker = [hotel["lat"], hotel["long"]];
            marker.bindPopup(hotel["name"]).openPopup();
            this.markers.push(marker);
          });

          // set center to first marker
          this.center = this.markers[0]._latlng;

          // set center to average of all markers
          this.center["lat"] = this.markers.map(x => x._latlng["lat"]).reduce((a, b) => a + b) / this.markers.length;
          this.center["lng"] = this.markers.map(x => x._latlng["lng"]).reduce((a, b) => a + b) / this.markers.length;

          // set zoom level to include all markers
          this.bounds = L.latLngBounds(this.markers.map(x => x._latlng));
          this.$nextTick(() => {
            const map = this.$refs.map.mapObject; //TODO doesn't select map, mapObject is undefined
            console.log(map);
            this.zoom = map.getBoundsZoom(this.bounds);
          });
        });
      });
    },
    openPopup(index) {
      console.log(index);
      console.log(this.markers[index]._popup._content);
      this.markers[index].openPopup(); // TODO doesn't work, no popup is shown
    }
  }
};


</script>

<template>
  <div class="map">
    <l-map
      ref="map"
      :center=center
      :zoom=zoom
      :minZoom=zoom-5
      :maxZoom=zoom+5
      :bounds=bounds
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
      <l-marker v-for="marker,index in markers" :lat-lng="marker._latlng" @click="openPopup(index)"></l-marker>
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