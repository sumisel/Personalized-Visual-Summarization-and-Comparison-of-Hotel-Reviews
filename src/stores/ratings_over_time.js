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

      for (const [timestamp, entry] of Object.entries(d)) {
        x_min = Math.min(x_min, +timestamp);
        x_max = Math.max(x_max, +timestamp);

        if (categoryId == "average") {
          const weighted_values = [];
          const review_values = [];
          let valueSum = 0;
          for (const [category, v] of Object.entries(entry)) {
            if (
                this.categoryStore.relevantCategories
                    .map((c) => c.id)
                    .includes(category)
                &&
                v["average"] != 0) {
              weighted_values.push(v["average"] * this.categoryStore.categoriesById[category]["value"]);
              review_values.push(v["values"]);
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
              entries: weighted_values,
              values: review_values,
            });
          }
        } else {
          const v = entry[categoryId];
          if(v["average"] != 0) {
            data.push({
              name: categoryId,
              timestamp: +timestamp,
              value: v["average"],
              upper: v["q3"],
              lower: v["q1"],
              num_entries: v["size"],
              values: v["values"],
            });
            const os  = {}
            for(const o in v["outliers"]) {
              outliers.push({ timestamp: timestamp, value: v["outliers"][o], idx_review: o });
            }
          }
        }
      }

      // cut off early dates
      //x_min = x_min + (x_max - x_min) / 4.0;
      // keep dates 3.5 to 1.5 years back
      x_min = x_max - 3.5 * 365 * 24 * 60 * 60 * 1000;
      x_max = x_max - 1.5 * 365 * 24 * 60 * 60 * 1000;
      return {"data": data.filter((d) => d["timestamp"] >= x_min && d["timestamp"] <= x_max), "x_min": x_min, "x_max": x_max, "outliers": outliers.filter((d) => d["timestamp"] >= x_min && d["timestamp"] <= x_max)};
    },
  },
})
