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
    // TODO: remove "hotels" as part of the state, it is already part of the hotelMeta
    hotels: [],
    selectedHotelIds: [],
  }),
  getters: {
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
    hotelIsSelected: (state) => {
      return (id) => state.selectedHotelIds.includes(id);
    },
  },
  actions: {
    async initHotels(city, hotelMeta) {
      this.hotels = Object.keys(hotelMeta).map(key => { const elem = hotelMeta[key]; elem['id'] = key; return elem; });

      // select first three hotels by default
      Object.keys(hotelMeta).forEach((hotelId, i) => {
        if (i < 3) {
          this.selectedHotelIds.push(hotelId);
        }
      });


    },
    toggleHotelSelection(id) {
      if (this.selectedHotelIds.includes(id)) {
        this.selectedHotelIds.splice(this.selectedHotelIds.indexOf(id), 1);
      } else {
        this.selectedHotelIds.push(id);
      }
    },
  },
})
