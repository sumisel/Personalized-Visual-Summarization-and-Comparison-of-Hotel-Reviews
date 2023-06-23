import { inject } from 'vue';
import { defineStore, storeToRefs } from 'pinia'

import { useCategoryStore } from "./category.js";
import { useClusterStore } from "./cluster.js";
import { useTimeStore } from "./ratings_over_time.js";

export const useHotelStore = defineStore({
  id: 'hotel',
  state: () => ({
    categoryStore: useCategoryStore(),
    clusterStore: useClusterStore(),
    timeStore: useTimeStore(),
    hotels: [],
    selectedHotelIds: [],
  }),
  getters: {
    selectedHotels: (state) => state.hotels.filter(hotel => hotel.isSelected)
      .sort((a, b) => a.isSelected - b.isSelected), // sort by index
    // TODO: use such a list of Ids state instead of "hotels"
    minRatings: (state) => {
      const hotelMeta = inject("hotelMeta");
      let minRatings = {
        location: 5.0,
        value: 5.0,
        rooms: 5.0,
        service: 5.0,
        cleanliness: 5.0,
        sleep: 5.0,
      }
      state.selectedHotelIds.forEach(hotelId => {
        const hotel = hotelMeta[hotelId];
        for (let categoryId in hotel.ratings) {
          minRatings[categoryId] = Math.min(minRatings[categoryId], hotel.ratings[categoryId]);
        }
      })
      return minRatings
    },
    maxRatings: (state) => {
      const hotelMeta = inject("hotelMeta");
      let maxRatings = {
        location: 0.0,
        value: 0.0,
        rooms: 0.0,
        service: .0,
        cleanliness: 0.0,
        sleep: 0.0,
      }
      state.selectedHotelIds.forEach(hotelId => {
        const hotel = hotelMeta[hotelId];
        for (let categoryId in hotel.ratings) {
          maxRatings[categoryId] = Math.max(maxRatings[categoryId], hotel.ratings[categoryId]);
        }
      })
      return maxRatings
    },
    countsCategoryPosNeg: (state) => {
      return (category, hotels) => {
        const reviews = inject("reviews");
        let counts = [];
        hotels.forEach(hotel => {
          counts.push({
            "name": hotel['name'],
            "posCount": reviews[hotel['id']]['counts']['pos'][category],
            "negCount": reviews[hotel['id']]['counts']['neg'][category],
          })
        })
        return counts;
      }
    },
    hotelById: (state) => {
      return (id) => state.hotels.find(hotel => hotel.id === id);
    },
    hotelIsSelected: (state) => {
      return (id) => state.selectedHotelIds.includes(id);
    },
  },
  actions: {
    async initHotels(city, hotelMeta) {
      this.hotels = Object.keys(hotelMeta).map(key => { const elem = hotelMeta[key]; elem['id'] = key; return elem; });

      // select first three hotels by default
      this.hotels.forEach((hotel, i) => {
        hotel["isSelected"] = i < 3 ? i + 1 : 0;
        if (i < 3) {
          this.selectedHotelIds.push(hotel.id);
        }
      });

      // initiate sentiment sentence clusters, for acceptable page performance, separate clusters from hotels
      //this.clusterStore.initClusters(this.hotels);

      // load ratings over time
      // TODO: this is a temporary solution, will be replaced when the data is in the enriched data file
      const ratings_time = await fetch("/HotelRec_subset_" + city + "_10_average_ratings_over_time.json");
      const ratings_time_data = await ratings_time.json();
      this.timeStore.initTimeData(this.hotels, ratings_time_data);
    },
    toggleHotelSelection(id) {
      const hotel = this.hotelById(id);
      hotel.isSelected = hotel.isSelected > 0 ? 0 : 1;
      if (this.selectedHotelIds.includes(id)) {
        this.selectedHotelIds.splice(state.selectedHotelIds.indexOf(id), 1);
      } else {
        this.selectedHotelIds.push(id);
      }
    },
  },
})
