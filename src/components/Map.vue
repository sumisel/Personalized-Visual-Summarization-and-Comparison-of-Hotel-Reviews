<script>
import { ref} from "vue";

import "leaflet/dist/leaflet.css";
import { LMap, LTileLayer, LMarker } from "@vue-leaflet/vue-leaflet";
import {useHotelStore} from "@/stores/hotel";


export default {
  components: {
    LMap,
    LTileLayer,
    LMarker},
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

          // set the color of the marker to blue if the hotel is selected
          this.markers.forEach((marker,index) => {
            this.colorMarker(index,this.hotelStore.hotelByName(marker._popup._content).isSelected);
          });

          // set center to first marker
          this.center = this.markers[0]._latlng;

          // set center to average of all markers
          this.center["lat"] = this.markers.map(x => x._latlng["lat"]).reduce((a, b) => a + b) / this.markers.length;
          this.center["lng"] = this.markers.map(x => x._latlng["lng"]).reduce((a, b) => a + b) / this.markers.length;

          // set zoom level to include all markers
          this.bounds = L.latLngBounds(this.markers.map(x => x._latlng));
          this.$nextTick(() => {
            //const map = this.$refs.map.mapObject; //TODO doesn't select map, mapObject is undefined
            console.log(this.map);
            this.zoom = this.map.getBoundsZoom(this.bounds); //TODO doesn't work, not a function
          });
        });
      });
    },
    openPopup(index) {
      console.log(index);
      console.log(this.markers[index]._popup._content);
      this.markers[index].openPopup(); // TODO doesn't work, no popup is shown
    },
    colorMarker(index, isSelected) {
      const greyIcon = new L.Icon({
        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-grey.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
      });
      const blueIcon = new L.Icon({
        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
      });

      if (isSelected)
        this.markers[index].icon = blueIcon;
      else
        this.markers[index].icon = greyIcon;
    },
    toggleSelectHotel(index) {
      console.log(index);
      const isSelected = this.hotelStore.hotelByName(this.markers[index]._popup._content).isSelected
      this.hotelStore.hotelByName(this.markers[index]._popup._content).isSelected = !isSelected;
      this.colorMarker(index,!isSelected);
      // TODO change the list of displayed hotels and everything that it entails, e.g., the average values and the summary
    }
  }
};


</script>

<template>
  <div class="ml-12 ml-16 instruction">Please click a marker to select/deselect a hotel.</div>
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
      <l-marker v-for="marker,index in markers" :lat-lng="marker._latlng" :icon="marker.icon" @mouseover="openPopup(index)" @click="toggleSelectHotel(index)"></l-marker>
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