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
        location: 4.9,
        value: 4.2,
        rooms: 3.5,
        service: 4.5,
        cleanliness: 4.1,
        sleep: 4.1,
      },
    }, {
      id: "B",
      name: "Grand Central",
      statement: "The old lady",
      ratings: {
        location: 3.0,
        value: 4.1,
        rooms: 3.9,
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
        rooms: 4.1,
        service: 4.2,
        cleanliness: 3.0,
        sleep: 4.4,
        business: 3.1,
        checkin: 4.2,
      },
    }]
  }),
  actions: {
    async getHotels() {
      const params = (new URL(document.location)).searchParams;
      const city = params.get("city")?params.get("city"):"Berlin";
      console.log("read hotels file "+city);
      const result = await fetch("/HotelRec_subset_"+city+"_10_average_ratings.txt");
      const data = await result.json();
      console.log(data);
      this.hotels = data;

      // set isSelected to true for the first 3 hotels
      this.hotels[0].isSelected = true;
      this.hotels[1].isSelected = true;
      this.hotels[2].isSelected = true;
      // set isSelected to false for all other hotels
      for (let i = 3; i < this.hotels.length; i++) {
          this.hotels[i].isSelected = false;
      }

      // set city name on page
      document.getElementById("city-name").innerHTML = city.replaceAll("_", " ");
    },
    async getLocations() {
      const params = (new URL(document.location)).searchParams;
      const city = params.get("city")?params.get("city"):"Berlin";
      console.log("read locations file "+city);
      const result = await fetch("/HotelRec_subset_"+city+"_10_locations.txt");
      const data = await result.json();
      console.log(data);

      return data;
    },
  },
  getters: {
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
      state.hotels.forEach(hotel => {
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
      state.hotels.forEach(hotel => {
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
        state.hotels.forEach((hotel2) => {
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
    hotelByName: (state) => {
      return (name) => state.hotels.find(hotel => hotel.name == name);
    },
    toggleSelectHotel: (state) => {
      return (name) => {state.hotels.find(hotel => hotel.name == name).isSelected = !state.hotels.find(hotel => hotel.name == name).isSelected};
    },
  },
})
