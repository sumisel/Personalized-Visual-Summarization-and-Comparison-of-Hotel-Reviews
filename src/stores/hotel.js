import { inject } from 'vue';
import { defineStore } from 'pinia'

import { useCategoryStore } from "./category.js";


export const useHotelStore = defineStore({
  id: 'hotel',
  state: () => ({
    selectedHotelIds: [],
    categoryStore: useCategoryStore(),
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
    overallRating: (state) => {
      const hotelMeta = inject("hotelMeta");
      return (hotelId) =>
        state.categoryStore.categories.reduce(
          (sum, category) =>
          (sum +=
            hotelMeta[hotelId].ratings[category.id] * state.categoryStore.normalizedCategoryValues[category.id]
          ),
          0
        )
    },
    hotelIsSelected: (state) => {
      return (id) => state.selectedHotelIds.includes(id);
    },
  },
  actions: {
    toggleHotelSelection(id) {
      if (this.selectedHotelIds.includes(id)) {
        this.selectedHotelIds.splice(this.selectedHotelIds.indexOf(id), 1);
      } else {
        this.selectedHotelIds.push(id);
      }
    },
    clearSelection() {
      this.selectedHotelIds = [];
    }
  },
})
