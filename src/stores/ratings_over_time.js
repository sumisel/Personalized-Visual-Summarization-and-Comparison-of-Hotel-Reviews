import { defineStore } from 'pinia'

export const useTimeStore = defineStore({
  id: 'time',
  state: () => ({
    ratings_over_time: {},
  }),
  getters: {
    dataById: (state) => state.ratings_over_time,
  },
  actions: {
    initTimeData(hotels, ratings_time_data) {
      this.ratings_over_time = {};
      hotels.forEach(hotel => {
        this.ratings_over_time[hotel.id] = ratings_time_data[hotel.id];
      })
    }
  },
})
