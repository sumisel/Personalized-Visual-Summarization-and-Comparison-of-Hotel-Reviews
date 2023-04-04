import { defineStore } from 'pinia'

export const useReviewStore = defineStore({
  id: 'review',
  state: () => ({
    reviews: {},
  }),
  getters: {
    reviewsById: (state) => state.reviews,
  },
  actions: {
    initReviews(hotels, reviews_data) {
      this.reviews = {};
      hotels.forEach(name => {
        this.reviews[name] = reviews_data[name];
      })
    }
  },
})
