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
    },
    // compute linear regression of ratings over time
    linearRegression(timeseries, categoryId) {
        let sum_x = 0;
        let sum_y = 0;
        let sum_xy = 0;
        let sum_xx = 0;
        let sum_yy = 0;

        for (const [timestamp, entries] of Object.entries(timeseries)) {
          const value = entries[categoryId]["average"];
          sum_x += timestamp;
          sum_y += value;
          sum_xy += timestamp * value;
          sum_xx += timestamp * timestamp;
          sum_yy += value * value;
        }

        // y = x * slope + intercept
        const slope = (n * sum_xy - sum_x * sum_y) / (n * sum_xx - sum_x * sum_x);
        const intercept = (sum_y - slope * sum_x) / n;

        // sample x and y result line points
        const result_values= [];

        for (const [timestamp, entries] of Object.entries(timeseries)) {
          const x = timestamp;
          const y = x * slope + intercept;
          result_values.push({"timestamp": timestamp, "value": y});
        }

        return result_values;
    }
  },
})
