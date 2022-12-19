import { defineStore, storeToRefs } from 'pinia'

import { useCategoryStore } from "./category.js";

export const useHotelStore = defineStore({
  id: 'hotel',
  state: () => ({
    categoryStore: useCategoryStore(),
    hotels: [{
      id: "A",
      name: "Hilton",
      statement: "Modern and convenient",
      ratings: {
        location: 4.5,
        value: 4.2,
        rooms: 3.7,
        service: 4.5,
        cleanliness: 4.4,
        sleep: 4.1,
      },
    }, {
      id: "B",
      name: "Grand Central",
      statement: "The old lady",
      ratings: {
        location: 4.0,
        value: 4.1,
        rooms: 3.3,
        service: 3.7,
        cleanliness: 3.9,
        sleep: 4.9,
      },
    }, {
      id: "C",
      name: "Monopol",
      statement: "Where the high society meets",
      ratings: {
        location: 4.0,
        value: 4.9,
        rooms: 4.8,
        service: 4.2,
        cleanliness: 3.0,
        sleep: 4.4,
      },
    }]
  }),
  getters: {
    minRatings: (state) => {
      let minRatings = {
        location: 5.0,
        value: 5.0,
        rooms: 5.0,
        service: 5.0,
        cleanliness: 5.0,
        sleep: 5.0,
      }
      state.hotels.forEach(hotel => {
        for (let categoryId in hotel.ratings) {
          minRatings[categoryId] = Math.min(minRatings[categoryId], hotel.ratings[categoryId]);
        }
      })
      return minRatings
    },
    isClearlyBest: (state) => {
      return (hotel) => {
        const ratingsDiff = {
          location: 5.0,
          value: 5.0,
          rooms: 5.0,
          service: 5.0,
          cleanliness: 5.0,
          sleep: 5.0,
        }
        state.hotels.forEach(hotel2 => {
          if (hotel.id != hotel2.id) {
            for (let categoryId in ratingsDiff) {
              ratingsDiff[categoryId] = Math.min(ratingsDiff[categoryId], hotel.ratings[categoryId] - hotel2.ratings[categoryId])
            }
          }
        })
        const clearlyBestCategories = [];
        for (let categoryId in ratingsDiff) {
          if (ratingsDiff[categoryId] > 0.29) {
            clearlyBestCategories.push(categoryId);
          }
        }
        return clearlyBestCategories
      }
    },
    overallRating: (state) => {
      return (hotel) =>
        Object.keys(hotel.ratings).reduce(
          (sum, categoryId) =>
          (sum +=
            hotel.ratings[categoryId] * state.categoryStore.normalizedCategoryValues[categoryId]
          ),
          0
        )

    },
  },
})
