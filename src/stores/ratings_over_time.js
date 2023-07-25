import { defineStore } from 'pinia'
import * as d3r from "d3-regression";

import { useCategoryStore } from "../stores/category.js";

export const useTimeStore = defineStore({
  id: 'time',
  state: () => ({
    ratings_over_time: {},
    categoryStore: useCategoryStore(),
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
    regression(data, x_min, x_max) {
      const regression = d3r.regressionLinear()
          .x(function(d) { return +d.timestamp })
          .y(function(d) { return +d.value })
          .domain([x_min, x_max]);

      // slope = regression(data)["a"];
      // intercept = regression(data)["b"];
      return regression(data);
    },
    compileCategoryData(hotelId, categoryId) {
      // x min is today as epoch timestamp
      var x_min = Math.floor(Date.now());
      var x_max = 0;

      // compute values for each category
      const data = [];
      const outliers = [];

      const d = this.ratings_over_time[hotelId];
      if (d == undefined) {
        return;
      }

      for (const [timestamp, values] of Object.entries(d)) {
        x_min = Math.min(x_min, +timestamp);
        x_max = Math.max(x_max, +timestamp);

        if (categoryId == "average") {
          const weighted_values = [];
          let valueSum = 0;
          for (const [category, v] of Object.entries(values)) {
            if (
                this.categoryStore.relevantCategories
                    .map((c) => c.id)
                    .includes(category)
                &&
                v["average"] != 0) {
              weighted_values.push(v["average"] * this.categoryStore.categoriesById[category]["value"]);
              valueSum += this.categoryStore.categoriesById[category]["value"];
            }
          }
          if (weighted_values.length > 0) {
            let weighted_average = weighted_values.reduce((a, b) => a + b, 0);
            weighted_average /= (valueSum);
            data.push({
              name: "average",
              timestamp: +timestamp,
              value: weighted_average,
              values: weighted_values,
            });
          }
        } else {
          const v = values[categoryId];
          if(v["average"] != 0) {
            data.push({
              name: "categoryId",
              timestamp: +timestamp,
              value: v["average"],
              upper: v["q3"],
              lower: v["q1"],
              num_entries: v["size"],
            });
            const os = v["outliers"].map(function (o) {
              return { timestamp: timestamp, value: o };
            });
            for (const o of os) {
              outliers.push(o);
            }
          }
        }
      }

      // cut off early dates
      //x_min = x_min + (x_max - x_min) / 4.0;
      // cut off dates more than 7 years back
      x_min = x_max - 7 * 365 * 24 * 60 * 60 * 1000;
      return {"data": data.filter((d) => d.timestamp >= x_min), "x_min": x_min, "x_max": x_max, "outliers": outliers.filter((d) => d.timestamp >= x_min)};
    },
  },
})
