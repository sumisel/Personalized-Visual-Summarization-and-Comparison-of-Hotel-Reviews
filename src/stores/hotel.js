import { defineStore, storeToRefs } from 'pinia'

import { useCategoryStore } from "./category.js";
import { useClusterStore } from "./cluster.js";
import { useTimeStore} from "./ratings_over_time.js";
import { globals } from './../main.js'

export const useHotelStore = defineStore({
  id: 'hotel',
  state: () => ({
    categoryStore: useCategoryStore(),
    clusterStore: useClusterStore(),
    timeStore: useTimeStore(),
    hotels: [],
  }),
  getters: {
    selectedHotels: (state) => state.hotels.filter(hotel => hotel.isSelected)
                                            .sort((a, b) => a.isSelected - b.isSelected), // sort by index
    minRatings: (state) => {
      let minRatings = {
        location: 5.0,
        value: 5.0,
        rooms: 5.0,
        service: 5.0,
        cleanliness: 5.0,
        sleep: 5.0,
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
      state.categoryStore.categories.reduce(
          (sum, category) =>
          (sum +=
            hotel.ratings[category.id] * state.categoryStore.normalizedCategoryValues[category.id]
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
    countsCategoryPosNeg: (state) => {
      return (category, hotels) => {
        //console.log("countsCategoryPosNeg ", category);
        let counts = [];
        hotels.forEach(hotel => {
          counts.push({"name": hotel['name'],
            "posCount": globals.$reviews[hotel['id']]['counts']['pos'][category],
            "negCount": globals.$reviews[hotel['id']]['counts']['neg'][category],
          })
          //console.log(hotel['counts']['pos']);
          //console.log(hotel['counts']['pos'][category]);
        })
        //console.log("countsCategoryPosNeg counts", counts);
        return counts;
      }
    },
    hotelByName: (state) => {
      return (name) => state.hotels.find(hotel => hotel.name === name);
    },
    hotelById: (state) => {
      return (id) => state.hotels.find(hotel => hotel.id === id);
    },
    hotelIsSelected: (state) => {
      return (id) => state.hotelById(id).isSelected > 0;
    },
    toggleHotelSelection: (state) => {
      return (id) => {
        const hotel = state.hotelById(id);
        hotel.isSelected = hotel.isSelected > 0 ? 0 : 1;
      }
    }

  },
  actions: {
    async initHotels(city) {
      this.hotels = Object.keys(globals.$hotelMeta).map(key => {const elem=globals.$hotelMeta[key]; elem['id']=key; return elem;});

      // select first three hotels by default
      this.hotels.forEach((hotel, i) => hotel["isSelected"] = i < 3 ? i+1 : 0);

      // initiate sentiment sentence clusters, for acceptable page performance, separate clusters from hotels
      //this.clusterStore.initClusters(this.hotels);

      // load ratings over time
      // TODO: this is a temporary solution, will be replaced when the data is in the enriched data file
      const ratings_time = await fetch("/HotelRec_subset_" + city + "_10_average_ratings_over_time.json");
      const ratings_time_data = await ratings_time.json();
      this.timeStore.initTimeData(this.hotels, ratings_time_data);
    },
    sentimentSummary(hotel, category, prefix) {
      console.log("sentimentSummary ", hotel['id'], " ", category, " ", prefix);
      let summary = [];

      // compile sentences from all categories if it's the overall summary
      if(category == 'overall') {
        for(let cat of this.categoryStore.relevantCategories) {
          let num_sentences = 0;
          if ( cat['value'] > 33 ) {
            num_sentences = 1;
          }
          if ( cat['value'] > 66 ) {
            num_sentences = 2;
          }
          let sentences = globals.$reviews[hotel['id']][prefix+'_summary'][cat['id']].sort((a, b) => a['idx_summary'] - b['idx_summary']).slice(0, num_sentences);
          sentences.forEach((sentence, i) => {
            sentence['color'] = cat['color'];
            sentence['category'] = cat['id'];
          });
          summary.push(...sentences);
        }
      } else {
        summary = globals.$reviews[hotel['id']][prefix+'_summary'][category].sort((a, b) => a['idx_summary'] - b['idx_summary']).slice(0, 5);

        summary.forEach((sentence, i) => {
          sentence['color'] = this.categoryStore.categoriesById[category]['color'];
          sentence['category'] = category;
        });
      }
      console.log("sentimentSummary ", summary);

      summary.forEach((sentence, i) => {
        sentence['text'] = globals.$reviews[hotel['id']]['reviews'][sentence['idx_review']][prefix+'_aspects'][sentence['idx_sentence']];
        sentence['idx_similar_reviews'].forEach((rev, j) => {
          rev['text'] = globals.$reviews[hotel['id']]['reviews'][rev['idx_review']][prefix+'_aspects'][rev['idx_sentence']];
        });
      });

      //console.log("sentimentSummary ", summary);
      return summary;
    },
  },
})
