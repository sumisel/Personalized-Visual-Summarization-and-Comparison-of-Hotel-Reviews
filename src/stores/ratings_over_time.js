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
    initTimeData(hotelIds, ratings_time_data) {
      this.ratings_over_time = {};
      hotelIds.forEach(hotelId => {
        this.ratings_over_time[hotelId] = ratings_time_data[hotelId];
      })
    }
  },
})
