import { defineStore, storeToRefs } from 'pinia'

import { useCategoryStore } from "./category.js";

export const useHotelStore = defineStore({
  id: 'hotel',
  state: () => ({
    categoryStore: useCategoryStore(),
    hotels: [],
  }),
  getters: {
    selectedHotels: (state) => state.hotels.filter(hotel => hotel.isSelected),
    minRatings: (state) => {
      let minRatings = {
        location: 5.0,
        value: 5.0,
        rooms: 5.0,
        service: 5.0,
        cleanliness: 5.0,
        sleep: 5.0,
        business: 5.0,
        checkin: 5.0,
      }
      state.selectedHotels.forEach(hotel => {
        for (let categoryId in hotel.ratings) {
          minRatings[categoryId] = Math.min(minRatings[categoryId], hotel.ratings[categoryId]);
        }
      })
      return minRatings
    },
    maxRatings: (state) => {
      let maxRatings = {
        location: 0.0,
        value: 0.0,
        rooms: 0.0,
        service: .0,
        cleanliness: 0.0,
        sleep: 0.0,
        business: 0.0,
        checkin: 0.0,
      }
      state.selectedHotels.forEach(hotel => {
        for (let categoryId in hotel.ratings) {
          maxRatings[categoryId] = Math.max(maxRatings[categoryId], hotel.ratings[categoryId]);
        }
      })
      return maxRatings
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
    bestCategories: (state) => {
      return (hotel) => {
        const categories = state.categoryStore.relevantCategories;
        const ratingsDiff = {
          location: 5.0,
          value: 5.0,
          rooms: 5.0,
          service: 5.0,
          cleanliness: 5.0,
          sleep: 5.0,
          business: 5.0,
          checkin: 5.0,
        };
        state.selectedHotels.forEach((hotel2) => {
          if (hotel.id != hotel2.id) {
            categories.forEach((category) => {
              ratingsDiff[category.id] = Math.min(
                ratingsDiff[category.id],
                hotel.ratings[category.id] - hotel2.ratings[category.id]
              );
            });
          }
        });
        const clearlyBestCategories = [];
        categories.forEach((category) => {
          if (ratingsDiff[category.id] > 0.29) {
            clearlyBestCategories.push(category.id);
          }
        });
        return clearlyBestCategories;
      }
    },
    topCategories: (state) => {
      return (hotel) => {
        const topCategories = state.categoryStore.relevantCategories.filter(
          (category) =>
            !state.bestCategories(hotel).includes(category.id) &&
            hotel.ratings[category.id] - state.minRatings[category.id] >
            0.29 &&
            hotel.ratings[category.id] -
            state.maxRatings[category.id] >
            -0.29
        );
        return topCategories.map((category) => category.id);
      }
    },
    overallPosNeg: (state) => {
      let sentiments = {};
      state.selectedHotels.forEach(hotel => {
        sentiments[hotel.name] = {"pos_summary_category": hotel["pos_summary"],
          "neg_summary_category": hotel["neg_summary"],
          "pos_counts_category": hotel["pos_counts_overall"],
          "neg_counts_category": hotel["neg_counts_overall"]
        }
      })
      return sentiments;
    },
    categoryPosNeg: (state) => {
      return (category) => {
        let sentiments = {};
        state.selectedHotels.forEach(hotel => {
          sentiments[hotel.name] = {"pos_summary_category": hotel["pos_summary_category"][category],
            "neg_summary_category": hotel["neg_summary_category"][category],
            "pos_counts_category": hotel["pos_counts_category"][category],
            "neg_counts_category": hotel["neg_counts_category"][category]
          }
        })
        return sentiments;
      }
    },
    hotelByName: (state) => {
      return (name) => state.hotels.find(hotel => hotel.name === name);
    },
    hotelById: (state) => {
      return (id) => state.hotels.find(hotel => hotel.id === id);
    },
  },
  actions: {
    async loadHotels(city) {
      // load hotel ratings
      city = city.replace(" ", "_");
      const result = await fetch("/HotelRec_subset_" + city + "_10_enriched.txt");
      const data = await result.json();
      this.hotels = data;
      // select first three hotels by default
      this.hotels.forEach((hotel, i) => hotel.isSelected = i < 3);
    },
  },
})
